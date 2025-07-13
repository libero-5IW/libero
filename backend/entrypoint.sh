#!/bin/sh
set -e

echo "[entrypoint] Injecting secrets..."

for file in /run/secrets/*; do
  [ -f "$file" ] || continue
  key=$(basename "$file")
  value=$(cat "$file")
  export "$key"="$value"
  echo "[entrypoint] Exported $key"
done

echo "[entrypoint] Starting app with JWT_SECRET=${JWT_SECRET:0:4}..."  # Debug: affiche les 4 1ers chars

exec npm run start:prod
