#!/bin/bash

if [ ! -f "$1" ]; then
  echo "Error: Input file not found" >&2
  exit 1
fi

CMD="foremost -i $1 -o /tmp/foremost_output"

if [ -n "$2" ]; then CMD="$CMD -c $2"; fi

$CMD
cat /tmp/foremost_output/audit.txt
rm -rf /tmp/foremost_output