#!/bin/bash
DOMAIN=$1
BRUTEFORCE=$2       # true or false
PASSIVE=$3          # true or false
ACTIVE=$4           # true or false
THREADS=$5          # integer

CMD="amass enum -d $DOMAIN"

if [[ "$PASSIVE" == "true" ]]; then
  CMD="$CMD -passive"
fi

if [[ "$ACTIVE" == "true" ]]; then
  CMD="$CMD -active"
fi

if [[ "$BRUTEFORCE" == "true" ]]; then
  CMD="$CMD -brute"
fi

if [[ -n "$THREADS" ]]; then
  CMD="$CMD -threads $THREADS"
fi

# Run the command
eval "$CMD"
