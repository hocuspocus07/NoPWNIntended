#!/bin/bash
set -euo pipefail  # Enable strict error handling

URL=$1
WORDLIST=$2        # common | big | mega | kali-small | kali-medium | kali-large | /custom/path
THREADS=$3
EXTENSIONS=$4      # comma-separated
FOLLOW_REDIRECTS=$5

SECLISTS_DIR="/usr/share/seclists"
KALI_WORDLISTS_DIR="/usr/share/wordlists"

# Wordlist resolution
case "${WORDLIST,,}" in
  common|small)
    WORDLIST="$SECLISTS_DIR/Discovery/Web-Content/common.txt"
    ;;
  big|medium)
    WORDLIST="$SECLISTS_DIR/Discovery/Web-Content/directory-list-2.3-medium.txt"
    ;;
  mega|large)
    WORDLIST="$SECLISTS_DIR/Discovery/Web-Content/directory-list-2.3-big.txt"
    ;;
  kali-standard)
    WORDLIST="$KALI_WORDLISTS_DIR/dirb/common.txt"
    ;;
  kali-large)
    WORDLIST="$KALI_WORDLISTS_DIR/dirb/big.txt"
    ;;
  *)
    if [[ ! -f "$WORDLIST" ]]; then
      echo "Error: Wordlist file not found: $WORDLIST" >&2
      echo "Available predefined options:" >&2
      echo "  common, big, mega, kali-small, kali-medium, kali-large" >&2
      exit 1
    fi
    ;;
esac

# Verify wordlist exists
if [[ ! -f "$WORDLIST" ]]; then
  echo "Error: Selected wordlist not found. Install seclists package with:" >&2
  echo "  apt update && apt install -y seclists" >&2
  exit 1
fi

CMD=(
  gobuster
  dir
  -u "$URL"
  -w "$WORDLIST"
  -t "$THREADS"
)

if [[ -n "$EXTENSIONS" ]]; then
  CMD+=(-x "$EXTENSIONS")
fi

if [[ "${FOLLOW_REDIRECTS,,}" == "true" ]]; then
  CMD+=(-r)
fi

# Print and execute
echo "Running:" "${CMD[@]}" >&2
"${CMD[@]}"