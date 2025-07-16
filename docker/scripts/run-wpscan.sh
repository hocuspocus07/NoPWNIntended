#!/bin/bash

TARGET=$1
SCAN_HIDDEN=$2  # true/false
AGGRESSIVE=$3

WPSCAN_OPTS="--url $TARGET"

if [[ "$SCAN_HIDDEN" == "true" ]]; then
  WPSCAN_OPTS="$WPSCAN_OPTS --enumerate u vp vt"
fi

case "$AGGRESSIVE" in
  low)
    WPSCAN_OPTS="$WPSCAN_OPTS --throttle 1500 --max-threads 2"
    ;;
  medium)
    WPSCAN_OPTS="$WPSCAN_OPTS --throttle 1000 --max-threads 5"
    ;;
  high)
    WPSCAN_OPTS="$WPSCAN_OPTS --throttle 500 --max-threads 10"
    ;;
  insane)
    WPSCAN_OPTS="$WPSCAN_OPTS --max-threads 50"
    ;;
esac

wpscan $WPSCAN_OPTS
