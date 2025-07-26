#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Email not provided" >&2
  exit 1
fi

CMD="holehe"

if [ "$2" = "true" ]; then CMD="$CMD --only-used"; fi
if [ "$3" = "true" ]; then CMD="$CMD --verbose"; fi
if [ "$4" != "5" ]; then CMD="$CMD --timeout $4"; fi
if [ -n "$5" ]; then CMD="$CMD --exclude $5"; fi
if [ "$6" != "text" ]; then CMD="$CMD --output-format $6"; fi

$CMD "$1"