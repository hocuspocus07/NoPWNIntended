#!/bin/bash

MODE="$1"
FILE="$2"

case "$MODE" in
  info)
    radare2 -c 'ii' -q0 "$FILE"
    ;;
  functions)
    radare2 -c 'afl' -q0 "$FILE"
    ;;
  disasm)
    radare2 -c 'pdf @ entry0' -q0 "$FILE"
    ;;
  *)
    echo "Unknown mode: $MODE"
    exit 1
    ;;
esac
