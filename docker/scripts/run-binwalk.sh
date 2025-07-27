#!/bin/bash

if [ ! -f "$1" ]; then
  echo "Error: Input file not found" >&2
  exit 1
fi

CMD="binwalk"

if [ "$2" = "true" ]; then CMD="$CMD -E"; fi
if [ "$3" = "true" ]; then CMD="$CMD -e --run-as=root"; fi

$CMD "$1"