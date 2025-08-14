#!/bin/bash
set -euo pipefail

exec 2>&1  

URL=$1
WORDLIST=$2
THREADS=$3
EXTENSIONS=$4
FOLLOW_REDIRECTS=$5

# Check if gobuster is installed
if ! command -v gobuster &> /dev/null; then
    echo "ERROR: Gobuster is not installed or not in PATH"
    echo "Install with: apt update && apt install -y gobuster"
    exit 1
fi

SECLISTS_DIR="/usr/share/seclists"
KALI_WORDLISTS_DIR="/usr/share/wordlists"

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
    WORDLIST_PATH="$KALI_WORDLISTS_DIR/dirb/common.txt"
    ;;
  kali-large)
    WORDLIST_PATH="$KALI_WORDLISTS_DIR/dirb/big.txt"
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

CMD=(
  gobuster
  dir
  -u "$URL"
  -w "$WORDLIST_PATH"
  -t "$THREADS"
  --no-progress  # Disable progress bar for cleaner output
  --no-color     # Disable colors for cleaner parsing
)


timeout 300 "${CMD[@]}" 2>&1 || {
    exit_code=$?
    echo "ERROR: Gobuster execution failed with exit code: $exit_code"
    if [ $exit_code -eq 124 ]; then
        echo "ERROR: Scan timed out after 5 minutes"
    fi
    exit $exit_code
}