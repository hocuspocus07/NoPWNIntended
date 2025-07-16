#!/bin/bash

HASH=$1                  # Hash to crack
HASH_TYPE=$2             
WORDLIST=$3              
ATTACK_MODE=$4          
RULES_FILE=$5           
WORKLOAD=$6             
USE_POTFILE=$7         

# Map hash types to Hashcat modes
declare -A HASH_MODES=(
  ["auto"]="auto"
  ["ntlm"]="1000"
  ["sha256"]="1400"
  ["sha512"]="1700"
  ["wpa"]="22000"
  ["django"]="10000"
  ["sha512crypt"]="1800"
)

# Map attack modes
declare -A ATTACK_MODES=(
  ["straight"]="0"
  ["combination"]="1"
  ["brute"]="3"
  ["hybrid_wm"]="6"
  ["hybrid_mw"]="7"
)

# Map wordlists
declare -A WORDLISTS=(
  ["rockyou"]="/usr/share/wordlists/rockyou.txt"
  ["crackstation"]="/usr/share/wordlists/crackstation.txt"
  ["weakpass"]="/usr/share/wordlists/weakpass.txt"
)

# Auto-detect hash type if needed
if [[ "${HASH_TYPE,,}" == "auto" ]]; then
  HASH_LEN=${#HASH}
  case $HASH_LEN in
    32) HASH_TYPE="0" ;;     # MD5
    40) HASH_TYPE="100" ;;   # SHA1
    64) HASH_TYPE="1400" ;;  # SHA-256
    128) HASH_TYPE="1700" ;; # SHA-512
    *) HASH_TYPE="0" ;;      # Default
  esac
else
  HASH_TYPE="${HASH_MODES[$HASH_TYPE]}"
fi

# Build base command
CMD="hashcat -m $HASH_TYPE -a ${ATTACK_MODES[$ATTACK_MODE]} -w $WORKLOAD"

# Add wordlist
if [[ -v WORDLISTS[$WORDLIST] ]]; then
  CMD="$CMD ${WORDLISTS[$WORDLIST]}"
else
  CMD="$CMD $WORDLIST"  # Custom path
fi

# Add rules if specified
[[ -n "$RULES_FILE" ]] && CMD="$CMD -r $RULES_FILE"

# Potfile handling
[[ "${USE_POTFILE,,}" == "true" ]] && CMD="$CMD --potfile-path hashcat.potfile"

# Add the hash
CMD="$CMD '$HASH'"

# Execute
eval "$CMD"