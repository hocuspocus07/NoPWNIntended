#!/bin/bash

URL=$1
MODE=$2  # detect or exploit

cd /opt/nosql-exploitation-framework

if [[ "$MODE" == "detect" ]]; then
  python3 nosqlif.py -u "$URL" -d
elif [[ "$MODE" == "exploit" ]]; then
  python3 nosqlif.py -u "$URL" -a
else
  echo "Invalid mode"
fi
