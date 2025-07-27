#!/bin/bash

set -euo pipefail

NMAP_CMD="nmap"

if [[ -n "$4" && "$4" != "null" ]]; then
  NMAP_CMD="$NMAP_CMD $4"
fi

if [[ -n "$2" && "$2" != "null" ]]; then
  NMAP_CMD="$NMAP_CMD -p $2"
fi

if [[ -n "$3" && "$3" != "null" ]]; then
  NMAP_CMD="$NMAP_CMD --script $3"
fi

NMAP_CMD="$NMAP_CMD $1"

$NMAP_CMD 2>&1 
