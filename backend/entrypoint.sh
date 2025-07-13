#!/bin/sh
set -e

echo "[entrypoint] Injecting secrets..."

for file in /run/secrets/*; do
  [ -f "$file" ] || continue
  key=$(basename "$file" | tr '[:lower:]' '[:upper:]')
  value=$(cat "$file")
  eval "export $key=\"\$value\""
  echo "[entrypoint] Exported $key"
done

exec npm run start:prod
