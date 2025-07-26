#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Username not provided" >&2
  exit 1
fi

CMD="sherlock"

if [ "$2" != "60" ]; then CMD="$CMD --timeout $2"; fi
if [ "$3" = "false" ]; then CMD="$CMD --no-found"; fi
if [ "$4" = "true" ]; then CMD="$CMD --print-not-found"; fi
if [ "$5" = "true" ]; then CMD="$CMD --csv"; fi
if [ "$6" = "true" ]; then CMD="$CMD --json"; fi
if [ -n "$7" ]; then CMD="$CMD --site $7"; fi
if [ -n "$8" ]; then CMD="$CMD --proxy $8"; fi
if [ "$9" = "true" ]; then CMD="$CMD --tor"; fi
if [ "${10}" = "true" ]; then CMD="$CMD --unique-tor"; fi

$CMD "$1"