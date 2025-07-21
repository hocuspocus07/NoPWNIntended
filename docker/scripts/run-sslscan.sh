#!/bin/bash

TARGET=$1
STARTTLS=$2         # none, smtp, ftp, ...
CERTS=$3            # true/false
HEARTBLEED=$4
COMPRESSION=$5
FALLBACK=$6
SIGNATURES=$7

CMD="/opt/testssl.sh/testssl.sh --quiet"

if [[ "$STARTTLS" != "none" ]]; then
  CMD="$CMD --starttls $STARTTLS"
fi

# Protocol check (always print all protocols)
CMD="$CMD -p"

[[ "${CERTS,,}" == "true" ]]       && CMD="$CMD --cert"
[[ "${HEARTBLEED,,}" == "true" ]]  && CMD="$CMD --heartbleed"
[[ "${COMPRESSION,,}" == "true" ]] && CMD="$CMD --compression"
[[ "${FALLBACK,,}" == "true" ]]    && CMD="$CMD --fallback"
[[ "${SIGNATURES,,}" == "true" ]]  && CMD="$CMD --sig"

CMD="$CMD $TARGET"

eval "$CMD"
