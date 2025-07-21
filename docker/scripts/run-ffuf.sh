#!/bin/bash
set -euo pipefail

exec 2>&1

URL=$1
WORDLIST=$2
THREADS=$3
EXTENSIONS=$4
RECURSIVE=$5
FOLLOW_REDIRECTS=$6

# Verify FFUF exists
FFUF_PATH=$(which ffuf || echo "")
if [[ -z "$FFUF_PATH" ]]; then
  echo "FFUF_NOT_INSTALLED" >&2
  exit 1
fi

# Simple wordlist resolution
if [[ "$WORDLIST" == "common" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/common.txt"
elif [[ "$WORDLIST" == "big" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt"
elif [[ "$WORDLIST" == "mega" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-big.txt"
else
  echo "WORDLIST_NOT_FOUND: $WORDLIST" >&2
  exit 1
fi

if [[ ! -f "$WORDLIST_PATH" ]]; then
  echo "WORDLIST_NOT_FOUND: $WORDLIST_PATH" >&2
  exit 1
fi

CMD=(
  "$FFUF_PATH"
  -u "${URL}/FUZZ"
  -w "$WORDLIST_PATH"
  -t "$THREADS"
  -noninteractive
  -o -
  -of json
)

if [[ -n "$EXTENSIONS" ]]; then
  IFS=',' read -ra EXT_ARRAY <<< "$EXTENSIONS"
  for ext in "${EXT_ARRAY[@]}"; do
    CMD+=(-e ".${ext}")
  done
fi

[[ "$RECURSIVE" == "true" ]] && CMD+=(-recursion)
[[ "$FOLLOW_REDIRECTS" == "true" ]] && CMD+=(-r)

exec "${CMD[@]}"