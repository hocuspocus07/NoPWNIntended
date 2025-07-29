#!/bin/bash
set -e

TARGET="$1"
AGGRESSIVENESS="$2"
OUTDIR="/tmp/skipfish-out-$$"
LOG_FILE="/tmp/skipfish-$$.log"

if ! command -v skipfish > /dev/null; then
  echo '{"status":"error","output":"Skipfish not installed","log":"Not found"}'
  exit 1
fi

if ! command -v jq > /dev/null; then
  echo '{"status":"error","output":"jq not installed","log":"Not found"}'
  exit 1
fi

case "$AGGRESSIVENESS" in
  low)    OPTS="-g 10 -m 2 -t 5" ;;
  medium) OPTS="-g 20 -m 3 -t 10" ;;
  high)   OPTS="-g 50 -m 4 -t 20" ;;
  insane) OPTS="-g 100 -m 5 -t 40" ;;
  *)      OPTS="" ;;
esac

timeout 300 skipfish $OPTS -o "$OUTDIR" "$TARGET" >> "$LOG_FILE" 2>&1
RC=$?

if [ $RC -eq 124 ]; then
  echo '{"status":"error","output":"Timeout","log":'$(jq -Rs . < "$LOG_FILE")'}'
  exit 1
elif [ $RC -ne 0 ]; then
  echo '{"status":"error","output":"Failed","log":'$(jq -Rs . < "$LOG_FILE")'}'
  exit 1
fi

REPORT="$OUTDIR/index.html"
if [ -f "$REPORT" ]; then
  REPORT_CONTENT=$(jq -Rs . < "$REPORT")
  echo '{"status":"success","output":"Scan complete","reportContent":'"$REPORT_CONTENT"',"log":'$(jq -Rs . < "$LOG_FILE")'}'
else
  echo '{"status":"error","output":"No report generated","log":'$(jq -Rs . < "$LOG_FILE")'}'
  exit 1
fi

rm -rf "$OUTDIR" "$LOG_FILE"
