#!/bin/bash

DOMAIN=$1
RECURSIVE=$2      # "true" or "false"
RAW=$3            # "true" or "false"

if [[ "$RAW" == "true" ]]; then
  whois "$DOMAIN"
else
  # Filtered output
  OUTPUT=$(whois "$DOMAIN")

  echo "Domain Name: $(echo "$OUTPUT" | grep -iE 'domain name' | head -n 1)"
  echo "Registrar: $(echo "$OUTPUT" | grep -iE 'registrar' | head -n 1)"
  echo "Updated Date: $(echo "$OUTPUT" | grep -iE 'updated date' | head -n 1)"
  echo "Creation Date: $(echo "$OUTPUT" | grep -iE 'creation date' | head -n 1)"
  echo "Expiry Date: $(echo "$OUTPUT" | grep -iE 'expiry|expiration date' | head -n 1)"
  echo "Name Servers:"
  echo "$OUTPUT" | grep -iE 'name server' | awk '{print $NF}' | sort -u

  if [[ "$RECURSIVE" == "true" ]]; then
    echo -e "\n>>> Recursive WHOIS Lookup (Registrar WHOIS Server):"
    REGWHOIS=$(echo "$OUTPUT" | grep -iE "whois server" | awk '{print $NF}' | head -n 1)

    if [[ -n "$REGWHOIS" ]]; then
      whois -h "$REGWHOIS" "$DOMAIN"
    else
      echo "No registrar WHOIS server found."
    fi
  fi
fi
