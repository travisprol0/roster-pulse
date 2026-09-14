#!/usr/bin/env bash
# The bundled React Native DevTools chrome-sandbox is often not writable and is
# not required for Expo web. Never abort the start command if we cannot touch it.
set +e
cache="${HOME}/.cache/dotslash"
if [[ -d "$cache" ]]; then
  find "$cache" -name chrome-sandbox -path '*DevTools*' 2>/dev/null | while IFS= read -r sandbox; do
    if [[ -f "$sandbox" && ! -u "$sandbox" ]]; then
      mv "$sandbox" "${sandbox}.disabled" 2>/dev/null
    fi
  done
fi
exec npx expo start --web "$@"
