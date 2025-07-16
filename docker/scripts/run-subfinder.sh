#!/bin/bash
DOMAIN=$1

# passive subdomain enumeration
subfinder -d "$DOMAIN" -silent
