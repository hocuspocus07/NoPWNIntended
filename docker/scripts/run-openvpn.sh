#!/bin/bash

CONFIG="$1"

if [ -z "$CONFIG" ]; then
  echo "Usage: $0 <config.ovpn>"
  exit 1
fi

if [ ! -f "$CONFIG" ]; then
  echo "File not found: $CONFIG"
  exit 2
fi

sudo openvpn --config "$CONFIG"
