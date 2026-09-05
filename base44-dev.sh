#!/bin/sh
# Entry point for the Base44 dev container.
# Installs npm deps, ensures the project is linked to a Base44 app, then starts
# `base44 dev` (local Deno backend + Vite frontend together).
set -e

cd /app

echo "[base44-dev] Installing npm dependencies..."
npm install

# Link the project to a Base44 app if not already linked.
if [ ! -f base44/.app.jsonc ]; then
  if [ -n "$BASE44_APP_ID" ]; then
    echo "[base44-dev] Linking to existing app $BASE44_APP_ID"
    mkdir -p base44
    cat > base44/.app.jsonc <<EOF
// Base44 App Configuration
{
  "id": "$BASE44_APP_ID"
}
EOF
  elif [ -n "$BASE44_API_KEY" ]; then
    echo "[base44-dev] No app id set — creating a new Base44 app to link against"
    base44 link --create --name "LouOS" -y
  else
    echo "[base44-dev] ERROR: BASE44_API_KEY is required to run the Base44 backend." >&2
    exit 1
  fi
fi

echo "[base44-dev] Starting base44 dev..."
exec base44 dev
