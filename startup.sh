#!/bin/sh
# Restart contract: preview proxy expects 0.0.0.0:8080.
if curl -sf http://127.0.0.1:8080/ >/dev/null 2>&1; then
  exit 0
fi
cd /workspace || exit 1
npm run dev >/tmp/tronx-dev.log 2>&1 &
exit 0
