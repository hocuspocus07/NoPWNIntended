#!/bin/bash

TARGET=$1            
STARTTLS=$2          # none, smtp, ftp, imap, pop3, ldap
VERSIONS=$3          # comma-separated e.g. "tls1_2,tls1_3"
CERTS=$4            
HEARTBLEED=$5       
COMPRESSION=$6       
FALLBACK=$7          
SIGNATURES=$8        

CMD="/opt/testssl.sh/testssl.sh --quiet"

# STARTTLS
if [[ "$STARTTLS" != "none" ]]; then
  CMD="$CMD --starttls $STARTTLS"
fi

# TLS version enforcement
IFS=',' read -ra VLIST <<< "$VERSIONS"
for ver in "${VLIST[@]}"; do
  CMD="$CMD --$ver"
done

# Options
[[ "${CERTS,,}" == "true" ]]       && CMD="$CMD --cert"
[[ "${HEARTBLEED,,}" == "true" ]]  && CMD="$CMD --heartbleed"
[[ "${COMPRESSION,,}" == "true" ]] && CMD="$CMD --compression"
[[ "${FALLBACK,,}" == "true" ]]    && CMD="$CMD --fallback"
[[ "${SIGNATURES,,}" == "true" ]]  && CMD="$CMD --sig"

CMD="$CMD $TARGET"

eval "$CMD"
