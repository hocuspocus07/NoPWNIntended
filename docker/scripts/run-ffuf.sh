#!/bin/bash
set -euo pipefail

URL=$1
WORDLIST=$2
THREADS=$3
EXTENSIONS=${4:-""}
RECURSIVE=${5:-"false"}
FOLLOW_REDIRECTS=${6:-"false"}

FFUF_PATH=$(which ffuf || echo "")
if [[ -z "$FFUF_PATH" ]]; then
  echo "FFUF_NOT_INSTALLED" >&2
  exit 1
fi

if [[ "$WORDLIST" == "common" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/common.txt"
elif [[ "$WORDLIST" == "big" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt"
elif [[ "$WORDLIST" == "mega" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-big.txt"
elif [[ "$WORDLIST" == "kali-standard" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt"
elif [[ "$WORDLIST" == "kali-large" ]]; then
  WORDLIST_PATH="/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-big.txt"
else
  echo "WORDLIST_NOT_FOUND: $WORDLIST" >&2
  exit 1
fi

if [[ ! -f "$WORDLIST_PATH" ]]; then
  echo "WORDLIST_NOT_FOUND: $WORDLIST_PATH" >&2
  exit 1
fi

TEMP_OUTPUT=$(mktemp)
TEMP_JSON=$(mktemp)

cleanup() {
  rm -f "$TEMP_OUTPUT" "$TEMP_JSON"
}
trap cleanup EXIT

CMD=(
  "$FFUF_PATH"
  -u "${URL}/FUZZ"
  -w "$WORDLIST_PATH"
  -t "$THREADS"
  -o "$TEMP_JSON"
  -of json
  -s  # Silent mode to reduce noise
)

if [[ -n "$EXTENSIONS" ]]; then
  IFS=',' read -ra EXT_ARRAY <<< "$EXTENSIONS"
  for ext in "${EXT_ARRAY[@]}"; do
    CMD+=(-e ".${ext}")
  done
fi

[[ "$RECURSIVE" == "true" ]] && CMD+=(-recursion)
[[ "$FOLLOW_REDIRECTS" == "true" ]] && CMD+=(-r)

echo "        /'___\  /'___\           /'___\       "
echo "       /\ \__/ /\ \__/  __  __  /\ \__/       "
echo "       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\       "
echo "        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/        "
echo "         \ \_\   \ \_\  \ \____/  \ \_\         "
echo "          \/_/    \/_/   \/___/    \/_/         "
echo ""
echo "       v2.1.0-dev"
echo "________________________________________________"
echo ""
echo " :: Method           : GET"
echo " :: URL              : ${URL}/FUZZ"
echo " :: Wordlist         : FUZZ: $WORDLIST_PATH"
echo " :: Extensions       : ${EXTENSIONS:-"(none)"}"
echo " :: Output file      : JSON"
echo " :: File format      : json"
echo " :: Follow redirects : $FOLLOW_REDIRECTS"
echo " :: Calibration      : false"
echo " :: Timeout          : 10"
echo " :: Threads          : $THREADS"
echo " :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500"
echo "________________________________________________"
echo ""

"${CMD[@]}" 2>&1 | while IFS= read -r line; do
  if [[ "$line" =~ Progress:\ \[([0-9]+)/([0-9]+)\] ]]; then
    current=${BASH_REMATCH[1]}
    total=${BASH_REMATCH[2]}
    percentage=$((current * 100 / total))
    echo "PROGRESS:$current:$total:$percentage" >&2
  fi
done

if [[ -f "$TEMP_JSON" ]] && [[ -s "$TEMP_JSON" ]]; then
  echo ""
  echo "Results:"
  echo "--------"
  
  jq -r '.results[] | "\(.status) \(.length) \(.url)"' "$TEMP_JSON" 2>/dev/null | while read -r status length url; do
    printf "%-4s %-8s %s\n" "$status" "$length" "$url"
  done
  
  total_results=$(jq '.results | length' "$TEMP_JSON" 2>/dev/null || echo "0")
  echo ""
  echo "Total results found: $total_results"
else
  echo ""
  echo "No results found or scan failed."
fi
