#!/bin/bash

URL=$1            
THREADS=$2         
SCAN_TYPE=$3      
ENCODE=$4         
WORDLIST_KEY=$5   

cd /opt/XSStrike

WORDLIST_FLAG=""

WORDLIST_KEY_LC=$(echo "$WORDLIST_KEY" | tr '[:upper:]' '[:lower:]')

if [[ "$WORDLIST_KEY_LC" == "common payloads" ]]; then
    WORDLIST_FLAG="-f /opt/XSStrike/payloads/common.txt"
elif [[ "$WORDLIST_KEY_LC" == "polyglot payloads" ]]; then
    WORDLIST_FLAG="-f /opt/XSStrike/payloads/polyglots.txt"
elif [[ "$WORDLIST_KEY_LC" == "fuzzdb xss" ]]; then
    WORDLIST_FLAG="-f /opt/XSStrike/payloads/fuzzdb-xss.txt"
fi

CMD="python3 xsstrike.py -u \"$URL\" --threads $THREADS --skip"

if [[ "${SCAN_TYPE,,}" == "payload" ]]; then
    CMD="$CMD --fuzzer"
fi

if [[ "${ENCODE,,}" == "true" ]]; then
    CMD="$CMD --encode url"
fi

if [[ -n "$WORDLIST_FLAG" ]]; then
    CMD="$CMD $WORDLIST_FLAG"
fi

# Execute
eval "$CMD"
