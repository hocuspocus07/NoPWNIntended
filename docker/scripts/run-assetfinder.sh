#!/bin/bash
DOMAIN=$1

assetfinder --subs-only "$DOMAIN" | sort -u