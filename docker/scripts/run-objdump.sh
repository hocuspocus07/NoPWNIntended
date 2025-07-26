#!/bin/bash

FILE="${@: -1}"     
ARGS=("${@:1:$#-1}")    

objdump "${ARGS[@]}" "$FILE"
