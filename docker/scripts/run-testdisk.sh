#!/bin/bash

if [ ! -f "$1" ]; then
  echo "Error: Input file not found" >&2
  exit 1
fi

valid_types=("auto" "intel" "gpt" "mac" "none" "sun" "xbox")
if [[ ! " ${valid_types[@]} " =~ " $2 " ]]; then
  echo "Error: Invalid partition type" >&2
  exit 1
fi

testdisk /log /cmd "$1" "$2" analyze quick dump quit
cat testdisk.log
rm testdisk.log