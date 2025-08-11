#!/bin/bash
set -euo pipefail

PCAP_FILE="${1:-}"
COMMAND_TYPE="${2:-}"
FILTER_EXPR="${3:-}"
SHOW_RAW_PACKETS="${4:-false}"

if [ -z "$PCAP_FILE" ] || [ ! -f "$PCAP_FILE" ]; then
  echo "Error: PCAP file not found or accessible." >&2
  exit 1
fi

case "$COMMAND_TYPE" in
  "packets")
    CMD=(tshark -r "$PCAP_FILE" -T fields \
      -E header=y -E separator=, -E quote=d \
      -e frame.number \
      -e frame.time \
      -e frame.time_epoch \
      -e ip.src -e ip.dst \
      -e ipv6.src -e ipv6.dst \
      -e tcp.srcport -e tcp.dstport \
      -e udp.srcport -e udp.dstport \
      -e _ws.col.Protocol \
      -e frame.protocols \
      -e _ws.col.Length \
      -e frame.len \
      -e _ws.col.Info \
      -e data.data)
    if [ -n "$FILTER_EXPR" ]; then
      CMD+=(-Y "$FILTER_EXPR")
    fi
    "${CMD[@]}" 2>/dev/null
    ;;

  "http_auth")
    tshark -r "$PCAP_FILE" -Y "http.authorization" -T fields \
      -e http.request.full_uri -e http.authorization -e ip.src -e ip.dst -e tcp.srcport -e tcp.dstport -e frame.number \
      -E header=y -E separator=, 2>/dev/null
    ;;

  "ftp_creds")
    tshark -r "$PCAP_FILE" -Y "ftp.request.command == USER or ftp.request.command == PASS" -T fields \
      -e ftp.request.command -e ftp.request.arg -e ip.src -e ip.dst -e tcp.srcport -e tcp.dstport -e frame.number \
      -E header=y -E separator=, 2>/dev/null
    ;;

  "packet_data_for_flags")
    tshark -r "$PCAP_FILE" -Y "data.text" -T fields \
      -e frame.number -e data.text -E header=y -E separator=, 2>/dev/null
    ;;

  *)
    echo "Error: Unknown command type: $COMMAND_TYPE" >&2
    exit 1
    ;;
esac
