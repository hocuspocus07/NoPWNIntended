#!/bin/bash

LENGTH="$1"
FILE="$2"
xxd -l "$LENGTH" "$FILE"
