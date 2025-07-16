#!/bin/bash
INPUT_FILE=$1

# collect subdomains to feed into DNSGen
dnsgen "$INPUT_FILE"
