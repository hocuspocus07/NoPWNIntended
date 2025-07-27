#!/bin/bash

if [ ! -f "$1" ]; then
  echo "Error: Input file not found" >&2
  exit 1
fi

valid_commands=("fls" "icat" "mmls")
if [[ ! " ${valid_commands[@]} " =~ " $2 " ]]; then
  echo "Error: Invalid TSK command" >&2
  exit 1
fi

case "$2" in
  "fls") fls -r -l "$1" ;;
  "icat") 
    if [ -z "$3" ]; then
      echo "Error: Inode number required for icat" >&2
      exit 1
    fi
    icat "$1" "$3" ;;
  "mmls") mmls "$1" ;;
esac