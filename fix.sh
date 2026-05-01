#!/bin/bash
# ==========================================
# VOTEXA CLEAN & START (LAN MODE)
# Linux/Mac equivalent of fix.bat
# ==========================================

set -e

echo "=========================================="
echo "VOTEXA CLEAN & START (LAN MODE)"
echo "=========================================="

echo "[1/8] Killing all Node processes..."
pkill -f "node" 2>/dev/null || true
pkill -f "ts-node" 2>/dev/null || true

echo "[2/8] Deleting node_modules and locks..."
rm -rf node_modules
rm -rf apps/frontend/node_modules
rm -rf apps/backend/node_modules
rm -f package-lock.json
rm -f apps/frontend/package-lock.json
rm -f apps/backend/package-lock.json

echo "[3/8] Clearing Global and Project Caches..."
rm -rf apps/frontend/.expo
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true

echo "[4/8] Installing Root Dependencies..."
npm install --legacy-peer-deps

echo "[5/8] Syncing Frontend SDK 54..."
cd apps/frontend
npm install --legacy-peer-deps
npx expo install --fix
cd ../..

echo "[6/8] Starting Backend (new terminal tab)..."
if command -v gnome-terminal &>/dev/null; then
  gnome-terminal -- bash -c "npm run dev:backend; exec bash"
elif command -v osascript &>/dev/null; then
  # macOS: open new Terminal window
  osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev:backend"'
else
  # Fallback: background process, logs to /tmp/votexa-backend.log
  nohup npm run dev:backend > /tmp/votexa-backend.log 2>&1 &
  echo "   Backend running in background. Logs: /tmp/votexa-backend.log"
fi

echo "[7/8] Starting Frontend (Metro LAN Mode)..."
echo "Make sure your phone and PC are on the same WiFi!"
echo "Install 'Expo Go' from Play Store / App Store, then scan the QR code."
echo ""
cd apps/frontend
npx expo start --clear
