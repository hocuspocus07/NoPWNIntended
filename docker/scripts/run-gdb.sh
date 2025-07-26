#!/bin/bash

CMD="$1"
FILE="$2"

# redirection and filter
exec 2>&1

case "$CMD" in
  run)
    gdb -batch -nx -quiet \
        -ex "set pagination off" \
        -ex "file $FILE" \
        -ex "run" \
        -ex "quit" | grep -vE "^Reading symbols|^\(gdb\)"
    ;;
  break)
    gdb -batch -nx -quiet \
        -ex "set pagination off" \
        -ex "file $FILE" \
        -ex "break main" \
        -ex "run" \
        -ex "quit" | grep -vE "^Reading symbols|^\(gdb\)"
    ;;
  info)
    gdb -batch -nx -quiet \
        -ex "set pagination off" \
        -ex "file $FILE" \
        -ex "info files" \
        -ex "quit" | grep -vE "^Reading symbols|^\(gdb\)"
    ;;
  *)
    echo "Unknown command: $CMD"
    exit 1
    ;;
esac