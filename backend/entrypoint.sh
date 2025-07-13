#!/bin/sh

set -e

echo "[INFO] Injecting secrets from /run/secrets into environment..."

for secret in /run/secrets/*; do
  [ -f "$secret" ] || continue
  VAR_NAME=$(basename "$secret")
  export "$VAR_NAME"="$(cat "$secret")"
done

echo "[INFO] Starting application..."
exec npm run start:prod
