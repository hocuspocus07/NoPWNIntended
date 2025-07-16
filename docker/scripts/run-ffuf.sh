#!/bin/bash

URL=$1
WORDLIST=$2        # common-2500 | big-10k | mega-50k | /custom/path.txt
THREADS=$3
EXTENSIONS=$4      # comma-separated
RECURSIVE=$5       
FOLLOW_REDIRECTS=$6  

# Wordlist resolution
case "$WORDLIST" in
  common-2500)
    WORDLIST="/app/wordlists/common.txt"
    ;;
  big-10k)
    WORDLIST="/app/wordlists/big.txt"
    ;;
  mega-50k)
    WORDLIST="/app/wordlists/mega.txt"
    ;;
esac

CMD="ffuf -u $URL/FUZZ -w $WORDLIST -t $THREADS"

if [[ -n "$EXTENSIONS" ]]; then
  CMD="$CMD -e .$EXTENSIONS"
fi

[[ "$RECURSIVE" == "true" ]] && CMD="$CMD -recursion"
[[ "$FOLLOW_REDIRECTS" == "true" ]] && CMD="$CMD -r"

eval "$CMD"
