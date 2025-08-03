#!/bin/bash

# PCAP Analysis Script for Docker Container
# Usage: ./analyze-pcap.sh <pcap_file> <output_format> <protocol_filter> <port_filter> <ip_filter> <time_range> <extract_credentials> <extract_flags> <stream_analysis> <deep_inspection> <custom_filter>

PCAP_FILE="$1"
OUTPUT_FORMAT="${2:-json}"
PROTOCOL_FILTER="$3"
PORT_FILTER="$4"
IP_FILTER="$5"
TIME_RANGE="$6"
EXTRACT_CREDENTIALS="${7:-true}"
EXTRACT_FLAGS="${8:-true}"
STREAM_ANALYSIS="${9:-true}"
DEEP_INSPECTION="${10:-false}"
CUSTOM_FILTER="${11}"

# Create a temporary directory
TEMP_DIR="/tmp/pcap_analysis_$$"
OUTPUT_FILE="$TEMP_DIR/analysis.json"

mkdir -p "$TEMP_DIR"

# Check if tshark is available
if ! command -v tshark &> /dev/null; then
    echo '{"error": "tshark not found. Please install Wireshark/tshark.", "packets": [], "streams": [], "findings": []}'
    exit 1
fi

# Build tshark filter
build_filter() {
    local filters=()
    
    if [[ -n "$PROTOCOL_FILTER" && "$PROTOCOL_FILTER" != "all" ]]; then
        filters+=("$PROTOCOL_FILTER")
    fi
    
    if [[ -n "$PORT_FILTER" ]]; then
        # Handle port ranges and lists
        if [[ "$PORT_FILTER" =~ ^[0-9,\-]+$ ]]; then
            local port_condition=""
            IFS=',' read -ra PORTS <<< "$PORT_FILTER"
            for port in "${PORTS[@]}"; do
                if [[ "$port" =~ ^([0-9]+)-([0-9]+)$ ]]; then
                    # Port range
                    local start="${BASH_REMATCH[1]}"
                    local end="${BASH_REMATCH[2]}"
                    if [[ -n "$port_condition" ]]; then
                        port_condition="$port_condition or "
                    fi
                    port_condition="${port_condition}(tcp.port >= $start and tcp.port <= $end) or (udp.port >= $start and udp.port <= $end)"
                else
                    # Single port
                    if [[ -n "$port_condition" ]]; then
                        port_condition="$port_condition or "
                    fi
                    port_condition="${port_condition}tcp.port == $port or udp.port == $port"
                fi
            done
            if [[ -n "$port_condition" ]]; then
                filters+=("($port_condition)")
            fi
        fi
    fi
    
    if [[ -n "$IP_FILTER" ]]; then
        if [[ "$IP_FILTER" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(/[0-9]+)?$ ]]; then
            filters+=("ip.addr == $IP_FILTER")
        fi
    fi
    
    if [[ -n "$CUSTOM_FILTER" ]]; then
        filters+=("($CUSTOM_FILTER)")
    fi
    
    # Join filters with "and"
    local filter_string=""
    for i in "${!filters[@]}"; do
        if [[ $i -gt 0 ]]; then
            filter_string="$filter_string and "
        fi
        filter_string="$filter_string${filters[$i]}"
    done
    
    echo "$filter_string"
}

# Function to extract packets
extract_packets() {
    local filter=$(build_filter)
    local tshark_cmd="tshark -r \"$PCAP_FILE\" -T json"
    
    if [[ -n "$filter" ]]; then
        tshark_cmd="$tshark_cmd -Y \"$filter\""
    fi
    
    tshark_cmd="$tshark_cmd -e frame.number -e frame.time -e ip.src -e ip.dst -e _ws.col.Protocol -e frame.len -e _ws.col.Info -e tcp.stream"
    
    eval "$tshark_cmd" 2>/dev/null | \
    jq -c '[.[] | {
        id: (._source.layers.frame["frame.number"] | tonumber),
        timestamp: ._source.layers.frame["frame.time"],
        source: (._source.layers.ip["ip.src"] // "N/A"),
        destination: (._source.layers.ip["ip.dst"] // "N/A"),
        protocol: (._source.layers._ws_col.Protocol // "Unknown"),
        length: (._source.layers.frame["frame.len"] | tonumber),
        info: (._source.layers._ws_col.Info // ""),
        stream: (._source.layers.tcp["tcp.stream"] | tonumber // null)
    }]' 2>/dev/null || echo '[]'
}

# Function to extract streams
extract_streams() {
    if [[ "$STREAM_ANALYSIS" != "true" ]]; then
        echo '[]'
        return
    fi
    
    tshark -r "$PCAP_FILE" -q -z conv,tcp 2>/dev/null | \
    awk 'NR>5 && NF>=5 {
        gsub(/[<>]/, "", $1)
        split($1, addr, ":")
        src_ip = addr[1]
        dst_ip = addr[2]
        packets = $4
        bytes = $5
        print "{\"id\":" NR-5 ",\"protocol\":\"TCP\",\"source\":\"" src_ip "\",\"destination\":\"" dst_ip "\",\"packets\":" packets ",\"bytes\":" bytes ",\"duration\":\"N/A\"}"
    }' | jq -s '.' 2>/dev/null || echo '[]'
}

# Function to find security findings
find_security_findings() {
    local findings=()
    
    # Search for credentials if enabled
    if [[ "$EXTRACT_CREDENTIALS" == "true" ]]; then
        local creds=$(tshark -r "$PCAP_FILE" -Y "http.request.method==POST" -T fields -e frame.number -e tcp.stream -e http.file_data 2>/dev/null | \
        while IFS=$'\t' read -r frame_num stream_id data; do
            if [[ "$data" =~ (username|user|login|email).*[=:].*(password|pass|pwd).*[=:] ]] || \
               [[ "$data" =~ (password|pass|pwd).*[=:].*(username|user|login|email).*[=:] ]]; then
                echo "{\"type\":\"credential\",\"content\":\"$data\",\"packet\":$frame_num,\"stream\":$stream_id,\"context\":\"HTTP POST data\"}"
            fi
        done | jq -s '.' 2>/dev/null || echo '[]')
        findings+=("$creds")
    fi
    
    # Search for flags if enabled
    if [[ "$EXTRACT_FLAGS" == "true" ]]; then
        local flags=$(tshark -r "$PCAP_FILE" -T fields -e frame.number -e tcp.stream -e data.text 2>/dev/null | \
        while IFS=$'\t' read -r frame_num stream_id data; do
            if [[ "$data" =~ (flag|FLAG|CTF)\{[^}]+\} ]]; then
                flag_match=$(echo "$data" | grep -oE '(flag|FLAG|CTF)\{[^}]+\}')
                echo "{\"type\":\"flag\",\"content\":\"$flag_match\",\"packet\":$frame_num,\"stream\":$stream_id,\"context\":\"Packet payload\"}"
            fi
        done | jq -s '.' 2>/dev/null || echo '[]')
        findings+=("$flags")
    fi
    
    # Combine all findings
    if [[ ${#findings[@]} -gt 0 ]]; then
        echo "${findings[@]}" | jq -s 'add' 2>/dev/null || echo '[]'
    else
        echo '[]'
    fi
}

# Main analysis
{
    echo "{"
    echo "\"packets\": $(extract_packets),"
    echo "\"streams\": $(extract_streams),"
    echo "\"findings\": $(find_security_findings)"
    echo "}"
} > "$OUTPUT_FILE" 2>/dev/null

# Output the result
if [[ -f "$OUTPUT_FILE" ]]; then
    cat "$OUTPUT_FILE"
else
    echo '{"packets": [], "streams": [], "findings": [], "error": "Analysis failed"}'
fi

# Cleanup
rm -rf "$TEMP_DIR" 2>/dev/null || true
