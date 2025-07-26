#!/bin/bash

if [ ! -f "$1" ]; then
  echo "Error: Input file not found" >&2
  exit 1
fi

CMD="exiftool"

case "$2" in
  "json") CMD="$CMD -json";;
  "csv") CMD="$CMD -csv";;
  "xml") CMD="$CMD -X";;
esac

if [ "$3" = "true" ]; then CMD="$CMD -G"; fi        # Group names
if [ "$4" = "true" ]; then CMD="$CMD -b"; fi        # Binary output
if [ "$5" = "true" ]; then CMD="$CMD -a"; fi        # Show all tags
if [ "$6" = "false" ]; then CMD="$CMD -common"; fi  # Show common tags
if [ -n "$7" ]; then CMD="$CMD -$7"; fi             # Specific tags
if [ "$8" = "true" ]; then CMD="$CMD -gps*"; fi     # Geotags only
if [ "$9" = "true" ]; then CMD="$CMD -all="; fi     # Remove metadata

$CMD "$1"

# Clean up
if [ "$9" = "true" ]; then
  OUTPUT_FILE="${1%.*}_clean.${1##*.}"
  if [ -f "$OUTPUT_FILE" ]; then
    cat "$OUTPUT_FILE"
    rm "$OUTPUT_FILE"
  fi
fi