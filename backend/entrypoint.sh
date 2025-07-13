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

# Debug POSIX-compatible
echo "[entrypoint] Starting app with JWT_SECRET=$(echo "$JWT_SECRET" | cut -c1-4)..."

exec npm run start:prod
