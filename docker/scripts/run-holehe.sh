#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Email not provided" >&2
  exit 1
fi

EMAIL="$1"
ONLY_USED="$2"
VERBOSE="$3"
TIMEOUT="$4"
EXCLUDE="$5"
OUTPUT_FORMAT="$6"

if [ "$OUTPUT_FORMAT" = "csv" ]; then
  TIMESTAMP=$(date +%s)
  OUTPUT_FILE="holehe_${TIMESTAMP}_${EMAIL}_results.csv"
  
  CMD="holehe -C"
  if [ "$ONLY_USED" = "true" ]; then CMD="$CMD --only-used"; fi
  if [ "$VERBOSE" = "true" ]; then CMD="$CMD --verbose"; fi
  if [ "$TIMEOUT" != "5" ]; then CMD="$CMD --timeout $TIMEOUT"; fi
  if [ -n "$EXCLUDE" ]; then CMD="$CMD --exclude $EXCLUDE"; fi
  
  $CMD "$EMAIL" > "$OUTPUT_FILE" 2>&1
  
  if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    cat "$OUTPUT_FILE"
    rm -f "$OUTPUT_FILE"
  else
    echo "Error: Failed to generate CSV output" >&2
    exit 1
  fi
else
  # Regular text or JSON output
  CMD="holehe"
  if [ "$ONLY_USED" = "true" ]; then CMD="$CMD --only-used"; fi
  if [ "$VERBOSE" = "true" ]; then CMD="$CMD --verbose"; fi
  if [ "$TIMEOUT" != "5" ]; then CMD="$CMD --timeout $TIMEOUT"; fi
  if [ -n "$EXCLUDE" ]; then CMD="$CMD --exclude $EXCLUDE"; fi
  
  $CMD "$EMAIL"
fi
