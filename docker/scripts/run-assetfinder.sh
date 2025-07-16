#!/bin/bash
DOMAIN=$1

# Assetfinder
assetfinder "$DOMAIN" | grep "$DOMAIN"
