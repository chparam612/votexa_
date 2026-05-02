@echo off
echo ==========================================
echo VOTEXA CLEAN & START (LAN MODE)
echo ==========================================

echo [1/8] Killing ALL Node processes...
taskkill /F /IM node.exe /T 2>nul

echo [2/8] Deleting node_modules and locks...
rmdir /s /q node_modules 2>nul
rmdir /s /q apps\frontend\node_modules 2>nul
rmdir /s /q apps\backend\node_modules 2>nul
del /f /q package-lock.json 2>nul
del /f /q apps\frontend\package-lock.json 2>nul

echo [3/8] Clearing Global and Project Caches...
rmdir /s /q apps\frontend\.expo 2>nul
rmdir /s /q %TEMP%\metro-* 2>nul

echo [4/8] Installing Root Dependencies...
call npm install --legacy-peer-deps

echo [5/8] Syncing Frontend SDK 54...
cd apps\frontend
call npm install --legacy-peer-deps
call npx expo install --fix

echo [6/8] Starting Backend...
start cmd /k "cd ../../ && npm run dev:backend"

echo [7/8] Starting Frontend (Metro LAN Mode)...
echo Make sure your phone and PC are on the same WiFi!
call npx expo start --clear

pause
