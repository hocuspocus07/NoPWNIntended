#!/bin/bash

TARGET=$1
STARTTLS=$2         # none, smtp, ftp, ...
CERTS=$3            # true/false
HEARTBLEED=$4
COMPRESSION=$5
FALLBACK=$6

CMD="/opt/testssl.sh/testssl.sh --quiet"

if [[ "$STARTTLS" != "none" ]]; then
  CMD="$CMD --starttls $STARTTLS"
fi

# Protocol check (always print all protocols)
CMD="$CMD -p"

[[ "${CERTS,,}" == "true" ]]       && CMD="$CMD -S"
[[ "${HEARTBLEED,,}" == "true" ]]  && CMD="$CMD -H"
[[ "${COMPRESSION,,}" == "true" ]] && CMD="$CMD -C"
[[ "${FALLBACK,,}" == "true" ]]    && CMD="$CMD -Z"

CMD="$CMD $TARGET"

eval "$CMD"