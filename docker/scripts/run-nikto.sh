#!/bin/bash

TARGET=$1
AGGRESSIVE=$2  

case "$AGGRESSIVE" in
  low)
    NIKTO_OPTS="-Tuning 2"  # interesting files
    ;;
  medium)
    NIKTO_OPTS="-Tuning 12349"  # common checks
    ;;
  high)
    NIKTO_OPTS="-Tuning 123456"  # more aggressive
    ;;
  insane)
    NIKTO_OPTS="-Tuning 1234567890"  # all checks
    ;;
  *)
    NIKTO_OPTS=""
    ;;
esac

nikto -h "$TARGET" $NIKTO_OPTS
