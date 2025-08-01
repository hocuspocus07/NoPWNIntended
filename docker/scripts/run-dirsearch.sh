#!/bin/bash
set -euo pipefail

exec 2>&1  

URL=$1
WORDLIST=$2
THREADS=$3
EXTENSIONS=${4:-""} 
RECURSIVE=${5:-false}  
FOLLOW_REDIRECTS=${6:-false} 



DIRSEARCH_PATHS=(
    "/opt/dirsearch/dirsearch.py"
    "/usr/local/bin/dirsearch"
    "/usr/bin/dirsearch"
    "$(which dirsearch 2>/dev/null || echo '')"
)

DIRSEARCH_CMD=""
for path in "${DIRSEARCH_PATHS[@]}"; do
    if [[ -n "$path" && -f "$path" ]]; then
        DIRSEARCH_CMD="$path"
        break
    fi
done

if [[ -z "$DIRSEARCH_CMD" ]]; then
    echo "ERROR: Dirsearch not found in any of these locations:"
    printf "  %s\n" "${DIRSEARCH_PATHS[@]}"
    echo "Install dirsearch or check installation path"
    exit 1
fi

if [[ "$DIRSEARCH_CMD" == *.py ]]; then
    if ! command -v python3 &> /dev/null; then
        echo "ERROR: Python3 not found but required for dirsearch.py"
        exit 1
    fi
    DIRSEARCH_CMD="python3 $DIRSEARCH_CMD"
fi

WORDLISTS_DIR="/usr/share/wordlists"
SECLISTS_DIR="/usr/share/seclists"

case "${WORDLIST,,}" in
  common|small)
    WORDLIST_PATH="$SECLISTS_DIR/Discovery/Web-Content/common.txt"
    ;;
  big|medium)
    WORDLIST_PATH="$SECLISTS_DIR/Discovery/Web-Content/directory-list-2.3-medium.txt" 
    ;;
  mega|large)
    WORDLIST_PATH="$SECLISTS_DIR/Discovery/Web-Content/directory-list-2.3-big.txt"
    ;;
  kali-standard)
    WORDLIST_PATH="$WORDLISTS_DIR/dirbuster/directory-list-lowercase-2.3-medium.txt"
    ;;
  kali-large)
    WORDLIST_PATH="$WORDLISTS_DIR/dirb/big.txt"
    ;;
  *)
    WORDLIST_PATH="$WORDLIST"
    ;;
esac

if [[ ! -f "$WORDLIST_PATH" ]]; then
  echo "ERROR: Wordlist file not found: $WORDLIST_PATH"
  echo "Available directories:"
  ls -la /usr/share/ 2>/dev/null | grep -E "(seclists|wordlists)" || echo "No wordlist directories found"
  
  echo "Searching for available wordlists..."
  find /usr/share -name "*.txt" -path "*/wordlist*" -o -path "*/seclists*" 2>/dev/null | head -10 || echo "No wordlists found"
  exit 1
fi

if [[ "$DIRSEARCH_CMD" == python3* ]]; then
    CMD=($DIRSEARCH_CMD -u "$URL" -w "$WORDLIST_PATH" -t "$THREADS")
else
    CMD=("$DIRSEARCH_CMD" -u "$URL" -w "$WORDLIST_PATH" -t "$THREADS")
fi

if [[ -n "$EXTENSIONS" && "$EXTENSIONS" != "false" && "$EXTENSIONS" != "none" ]]; then
    CMD+=(-e "$EXTENSIONS")
fi

[[ "${RECURSIVE,,}" == "true" ]] && CMD+=("-r")
[[ "${FOLLOW_REDIRECTS,,}" == "true" ]] && CMD+=("--follow-redirects")

echo "________________________________________________"
echo ""
echo " :: Target           : $URL"
echo " :: Wordlist         : $WORDLIST_PATH"
echo " :: Extensions       : ${EXTENSIONS:-"(none)"}"
echo " :: Threads          : $THREADS"
echo " :: Recursive        : $RECURSIVE"
echo " :: Follow redirects : $FOLLOW_REDIRECTS"
echo "________________________________________________"
echo ""

timeout 300 "${CMD[@]}" 2>&1 | grep -v "Scanning:" | grep -v "job:" | grep -v "errors:" | grep -v "^\[.*\]" | grep -v "^$" || {
    exit_code=$?
    echo "ERROR: Dirsearch execution failed with exit code: $exit_code"
    if [ $exit_code -eq 124 ]; then
        echo "ERROR: Scan timed out after 5 minutes"
    fi
    exit $exit_code
}

echo ""
echo "________________________________________________"
echo "Scan completed successfully"
