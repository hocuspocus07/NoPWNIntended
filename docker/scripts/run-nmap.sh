#!/bin/bash

TARGET="$1"
PORTS="$2"
SCRIPTS="$3"
OPTIONS="$4"

echo "=== Starting Nmap Scan ==="
echo "Target : $TARGET"
echo "Ports  : $PORTS"
echo "Script : $SCRIPTS"
echo "Options: $OPTIONS"

NMAP_CMD="nmap"
if [[ -n "$OPTIONS" ]]; then
  NMAP_CMD="$NMAP_CMD $OPTIONS"
fi
if [[ -n "$PORTS" ]]; then
  NMAP_CMD="$NMAP_CMD -p $PORTS"
fi
if [[ -n "$SCRIPTS" ]]; then
  NMAP_CMD="$NMAP_CMD --script $SCRIPTS"
fi
NMAP_CMD="$NMAP_CMD $TARGET"

echo "Running: $NMAP_CMD"
eval $NMAP_CMD
