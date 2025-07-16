#!/bin/bash

URL=$1
WORDLIST=$2
THREADS=$3
EXTENSIONS=$4
RECURSIVE=$5
FOLLOW_REDIRECTS=$6

case "$WORDLIST" in
  common-2500) WORDLIST="/app/wordlists/common.txt" ;;
  big-10k) WORDLIST="/app/wordlists/big.txt" ;;
  mega-50k) WORDLIST="/app/wordlists/mega.txt" ;;
esac

CMD="python3 /opt/dirsearch/dirsearch.py -u $URL -e $EXTENSIONS -w $WORDLIST -t $THREADS"

[[ "${RECURSIVE,,}" == "true" ]] && CMD="$CMD -r"
[[ "${FOLLOW_REDIRECTS,,}" == "true" ]] && CMD="$CMD --follow-redirects"

eval "$CMD"
