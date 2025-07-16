#!/bin/bash

URL=$1                  # Target URL
PARAMS=$2               # search,query,id
THREADS=$3              # Number of threads
XSS_TYPE=$4             # reflected | dom | stored
SCAN_TYPE=$5            # detect | payload
ENCODE=$6               # true | false

cd /opt/XSStrike

# Build base command
CMD="python3 xsstrike.py -u \"$URL\" --threads $THREADS"

# Add XSS Type
case "$XSS_TYPE" in
  reflected) CMD="$CMD --reflected" ;;
  dom)       CMD="$CMD --dom" ;;
  stored)    CMD="$CMD --stored" ;;
esac

# Add scan type
if [[ "$SCAN_TYPE" == "payload" ]]; then
  CMD="$CMD --fuzzer"
fi

# URL Encode
[[ "$ENCODE" == "true" ]] && CMD="$CMD --encode"

# Parameters to test
IFS=',' read -ra PARAM_LIST <<< "$PARAMS"
for param in "${PARAM_LIST[@]}"; do
  CMD="$CMD -p $param"
done

# Execute
eval "$CMD"
