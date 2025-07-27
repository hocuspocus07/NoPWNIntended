#!/bin/bash
DOMAIN=$1

mkdir -p ~/.config/subfinder

if [ ! -f ~/.config/subfinder/config.yaml ]; then
  cat > ~/.config/subfinder/config.yaml <<EOL
resolvers:
  - 1.1.1.1
  - 8.8.8.8
  - 9.9.9.9
sources:
  - alienvault
  - anubis
  - commoncrawl
  - crtsh
  - hackertarget
  - rapiddns
  - sonarsearch
  - sublist3r
  - threatminer
  - urlscan
  - wayback
EOL
fi

# more aggressive settings
subfinder -d "$DOMAIN" -all -silent | sort -u