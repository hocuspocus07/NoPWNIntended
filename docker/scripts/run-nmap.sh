#!/bin/bash

TARGET=$1
PORTS=$2          # e.g. "21,22,80" or "top-ports"
SCAN_OPTS=$3      # e.g. "-sV -O -A -sC"
SCRIPTS=$4        # e.g. "vulners,http-headers" (comma-separated)

CMD="nmap $SCAN_OPTS"

# Handle ports
if [[ "$PORTS" == "top-ports" ]]; then
  CMD="$CMD --top-ports 100"
elif [[ -n "$PORTS" ]]; then
  CMD="$CMD -p $PORTS"
fi

# Handle scripts
if [[ -n "$SCRIPTS" ]]; then
  IFS=',' read -ra SCRIPT_ARRAY <<< "$SCRIPTS"
  for script in "${SCRIPT_ARRAY[@]}"; do
    CMD="$CMD --script=$script"
  done
fi

# Append target
CMD="$CMD $TARGET"

# Run the command
eval "$CMD"
