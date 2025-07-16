#!/bin/bash

URL=$1
WORDLIST=$2
THREADS=$3
EXTENSIONS=$4
FOLLOW_REDIRECTS=$5  
# no recursion here
case "$WORDLIST" in
  common-2500) WORDLIST="/app/wordlists/common.txt" ;;
  big-10k) WORDLIST="/app/wordlists/big.txt" ;;
  mega-50k) WORDLIST="/app/wordlists/mega.txt" ;;
esac

CMD="gobuster dir -u $URL -w $WORDLIST -t $THREADS"

[[ -n "$EXTENSIONS" ]] && CMD="$CMD -x $EXTENSIONS"
[[ "$FOLLOW_REDIRECTS" == "true" ]] && CMD="$CMD -r"

eval "$CMD"
