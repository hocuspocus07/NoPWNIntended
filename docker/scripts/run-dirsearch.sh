#!/bin/bash

URL=$1
WORDLIST=$2          # common-2500 | big-10k | mega-50k | kali-standard | kali-large | custom-path
THREADS=$3
EXTENSIONS=$4
RECURSIVE=$5
FOLLOW_REDIRECTS=$6

WORDLISTS_DIR="/usr/share/wordlists"
SECLISTS_DIR="/usr/share/seclists"

# Map wordlist names
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
    WORDLIST="$WORDLISTS_DIR/dirbuster/directory-list-lowercase-2.3-medium.txt"
    ;;
  kali-large)
    WORDLIST="$WORDLISTS_DIR/dirb/big.txt"
    ;;
  *)
    if [[ ! -f "$WORDLIST" ]]; then
      echo "Error: Wordlist file not found: $WORDLIST"
      echo "Available predefined options: common-2500, big-10k, mega-50k, kali-standard, kali-large"
      exit 1
    fi
    ;;
esac

# Verify wordlist exists
if [[ ! -f "$WORDLIST" ]]; then
  echo "Error: Selected wordlist not found. Install seclists package:"
  echo "  apt update && apt install -y seclists"
  exit 1
fi

CMD=("python3" "/opt/dirsearch/dirsearch.py" "-u" "$URL" "-e" "$EXTENSIONS" "-w" "$WORDLIST" "-t" "$THREADS")

# Add options
[[ "${RECURSIVE,,}" == "true" ]] && CMD+=("-r")
[[ "${FOLLOW_REDIRECTS,,}" == "true" ]] && CMD+=("--follow-redirects")

echo "Running:" "${CMD[@]}"
"${CMD[@]}"