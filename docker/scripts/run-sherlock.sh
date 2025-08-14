#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Username not provided" >&2
  exit 1
fi

USERNAME="$1"
TIMEOUT="$2"
PRINT_FOUND="$3"
PRINT_NOT_FOUND="$4"
CSV="$5"
JSON="$6"
SITE="$7"
PROXY="$8"
TOR="$9"
UNIQUE_TOR="${10}"

CMD="sherlock"

if [ "$TIMEOUT" != "60" ]; then 
  CMD="$CMD --timeout $TIMEOUT"
fi

if [ "$PRINT_FOUND" = "false" ]; then 
  CMD="$CMD --print-all" 
else
  CMD="$CMD --print-found"  
fi

if [ "$CSV" = "true" ]; then 
  CMD="$CMD --csv"
  OUTPUT_FILE="/tmp/sherlock_$(date +%s)_${USERNAME}_results.csv"
  CMD="$CMD --output $OUTPUT_FILE"
fi

if [ "$JSON" = "true" ]; then 
  CMD="$CMD --json /tmp/sherlock_$(date +%s)_${USERNAME}_results.json"
fi

if [ -n "$SITE" ]; then 
  CMD="$CMD --site $SITE"
fi

if [ -n "$PROXY" ]; then 
  CMD="$CMD --proxy $PROXY"
fi

if [ "$TOR" = "true" ]; then 
  CMD="$CMD --tor"
fi

if [ "$UNIQUE_TOR" = "true" ]; then 
  CMD="$CMD --unique-tor"
fi

# Execute the command
$CMD "$USERNAME"

if [ "$CSV" = "true" ] && [ -f "$OUTPUT_FILE" ]; then
  echo "CSV_FILE_START"
  cat "$OUTPUT_FILE"
  echo "CSV_FILE_END"
  rm -f "$OUTPUT_FILE"
fi
