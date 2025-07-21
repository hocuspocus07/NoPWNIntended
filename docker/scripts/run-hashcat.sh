#!/bin/bash
set -euo pipefail  # Enable strict error handling

HASH="$1"
HASH_TYPE="$2"
WORDLIST="$3"
ATTACK_MODE="$4"
RULES_FILE="$5"
WORKLOAD="${6:-3}"
USE_POTFILE="${7:-false}"

# Create temp file for hash
TEMP_HASH_FILE="/tmp/hashcat_input.txt"
echo "$HASH" > "$TEMP_HASH_FILE"

# Security check - prevent command injection
validate_alnum() {
  if [[ "$1" =~ [^a-zA-Z0-9_-] ]]; then
    echo "Error: Invalid characters in $2" >&2
    exit 1
  fi
}

# Hash type mappings
declare -A HASH_MODES=(
  ["auto"]="auto"
  ["ntlm"]="1000"
  ["sha256"]="1400" 
  ["sha512"]="1700"
  ["wpa"]="22000"
  ["django"]="10000"
  ["sha512crypt"]="1800"
  ["md5"]="0"
  ["sha1"]="100"
)

# Attack mode mappings
declare -A ATTACK_MODES=(
  ["straight"]="0"
  ["combination"]="1" 
  ["brute"]="3"
  ["hybrid_wm"]="6"
  ["hybrid_mw"]="7"
)

declare -A WORDLISTS=(
  ["rockyou"]="/usr/share/wordlists/rockyou.txt"
  ["crackstation"]="/usr/share/wordlists/crackstation.txt"
  ["weakpass"]="/usr/share/wordlists/weakpass.txt"
  ["seclists"]="/usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt"
)

# Validate inputs
validate_alnum "$HASH_TYPE" "hash type"
validate_alnum "$ATTACK_MODE" "attack mode"
validate_alnum "$WORKLOAD" "workload profile"

# Auto-detect hash type if needed
if [[ "${HASH_TYPE,,}" == "auto" ]]; then
  HASH_LEN=${#HASH}
  case $HASH_LEN in
    32) HASH_TYPE="0" ;;     # MD5
    40) HASH_TYPE="100" ;;   # SHA1
    64) HASH_TYPE="1400" ;;  # SHA-256
    128) HASH_TYPE="1700" ;; # SHA-512
    *) HASH_TYPE="0" ;;      # Default to MD5
  esac
else
  HASH_TYPE="${HASH_MODES[${HASH_TYPE,,}]}"
  if [[ -z "$HASH_TYPE" ]]; then
    echo "Error: Unknown hash type '$HASH_TYPE'" >&2
    exit 1
  fi
fi

# Verify wordlist exists
if [[ -v WORDLISTS[$WORDLIST] ]]; then
  WORDLIST_PATH="${WORDLISTS[$WORDLIST]}"
else
  WORDLIST_PATH="$WORDLIST" 
fi

if [[ ! -f "$WORDLIST_PATH" ]]; then
  echo "Error: Wordlist not found. Install with:" >&2
  echo "  sudo apt update && sudo apt install -y wordlists seclists" >&2
  exit 1
fi

CMD=(
  hashcat
  --quiet
  -m "$HASH_TYPE"
  -a "${ATTACK_MODES[${ATTACK_MODE,,}]}"
  -w "$WORKLOAD"
)

if [[ -n "$RULES_FILE" && "$RULES_FILE" != "-" && -f "$RULES_FILE" ]]; then
  CMD+=(-r "$RULES_FILE")
fi

if [[ "${USE_POTFILE,,}" == "true" ]]; then
  CMD+=(--potfile-path "hashcat-$(date +%s).potfile")
fi

# CORRECT ORDER: hashfile, then wordlist
CMD+=("$TEMP_HASH_FILE" "$WORDLIST_PATH")

# Execute
echo "Running:" "${CMD[@]}" >&2
"${CMD[@]}"

# ... (after running hashcat and before cleanup:)
CRACKED=$(hashcat --show -m "$HASH_TYPE" "$TEMP_HASH_FILE" || true)
echo "$CRACKED"

rm -f "$TEMP_HASH_FILE"
