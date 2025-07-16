#!/bin/bash

TARGET=$1
AGGRESSIVE=$2  

OUTDIR="/tmp/skipfish-out-$(date +%s)"

case "$AGGRESSIVE" in
  low)
    SKIPFISH_OPTS="-g 10 -m 2 -t 5"  # low connections, shallow scan
    ;;
  medium)
    SKIPFISH_OPTS="-g 20 -m 3 -t 10"
    ;;
  high)
    SKIPFISH_OPTS="-g 50 -m 4 -t 20"
    ;;
  insane)
    SKIPFISH_OPTS="-g 100 -m 5 -t 40"  # very aggressive
    ;;
  *)
    SKIPFISH_OPTS=""
    ;;
esac

skipfish $SKIPFISH_OPTS -o "$OUTDIR" "$TARGET"
echo -e "\n[+] Skipfish scan complete. HTML report saved to: $OUTDIR/index.html"
