#!/usr/bin/env bash
# Build script — builds frontend and copies to backend static directory
set -euo pipefail

echo "==> Building frontend..."
cd "$(dirname "$0")/frontend"
node ./node_modules/vite/bin/vite.js build

echo "==> Copying to backend static..."
rm -rf ../backend/static
mkdir -p ../backend/static
cp -r dist/* ../backend/static/

echo "==> Done! Backend/static is ready."
echo "    Run: cd backend && uv run uvicorn brain_game.main:app --port 8000"
