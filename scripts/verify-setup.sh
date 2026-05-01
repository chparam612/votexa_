#!/bin/bash
# ==========================================
# VOTEXA SETUP VERIFIER
# Checks environment, credentials, and
# backend health before starting the app.
# ==========================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PASS="\033[32m✅\033[0m"
FAIL="\033[31m❌\033[0m"
WARN="\033[33m⚠️\033[0m"
INFO="\033[36mℹ️\033[0m"

errors=0

echo ""
echo "=========================================="
echo " VOTEXA SETUP VERIFIER"
echo "=========================================="
echo ""

# ---- 1. .env file ----
echo "[1/6] Checking .env file..."
if [ -f "$ROOT_DIR/.env" ]; then
  echo -e "  $PASS .env file found"

  REQUIRED_KEYS=(
    "EXPO_PUBLIC_FIREBASE_API_KEY"
    "EXPO_PUBLIC_FIREBASE_APP_ID"
    "EXPO_PUBLIC_BACKEND_URL"
    "GOOGLE_CLOUD_PROJECT"
  )

  for key in "${REQUIRED_KEYS[@]}"; do
    value=$(grep -E "^${key}=" "$ROOT_DIR/.env" | cut -d '=' -f2-)
    if [ -z "$value" ] || [[ "$value" == *"your_"* ]] || [[ "$value" == *"xxxxx"* ]]; then
      echo -e "  $FAIL $key is missing or still a placeholder"
      errors=$((errors + 1))
    else
      echo -e "  $PASS $key is set"
    fi
  done
else
  echo -e "  $FAIL .env file not found!"
  echo -e "  $INFO Run: cp .env.example .env  then fill in your values"
  errors=$((errors + 1))
fi

echo ""

# ---- 2. service-account.json ----
echo "[2/6] Checking service-account.json..."
if [ -f "$ROOT_DIR/service-account.json" ]; then
  # Validate it's valid JSON with expected fields
  if command -v node &>/dev/null; then
    valid=$(SA_PATH="$ROOT_DIR/service-account.json" node -e "
      try {
        const sa = require(process.env.SA_PATH);
        const ok = sa.type === 'service_account' && !!sa.project_id && !!sa.private_key;
        process.stdout.write(ok ? 'yes' : 'no');
      } catch(e) { process.stdout.write('no'); }
    " 2>/dev/null)
    if [ "$valid" = "yes" ]; then
      echo -e "  $PASS service-account.json found and valid"
    else
      echo -e "  $FAIL service-account.json found but appears invalid (check JSON format)"
      errors=$((errors + 1))
    fi
  else
    echo -e "  $PASS service-account.json found (install Node.js for full validation)"
  fi
else
  echo -e "  $FAIL service-account.json not found!"
  echo -e "  $INFO Firebase Console → Project Settings → Service Accounts → Generate new private key"
  echo -e "  $INFO Save it as: $ROOT_DIR/service-account.json"
  errors=$((errors + 1))
fi

echo ""

# ---- 3. gcloud CLI ----
echo "[3/6] Checking Google Cloud CLI..."
if command -v gcloud &>/dev/null; then
  GCLOUD_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1)
  if [ -n "$GCLOUD_ACCOUNT" ]; then
    echo -e "  $PASS gcloud logged in as: $GCLOUD_ACCOUNT"
  else
    echo -e "  $WARN gcloud installed but not logged in"
    echo -e "  $INFO Run: gcloud auth login && gcloud auth application-default login"
    errors=$((errors + 1))
  fi
else
  echo -e "  $WARN gcloud CLI not found (needed only for Cloud Run deploy)"
  echo -e "  $INFO Install from: https://cloud.google.com/sdk/docs/install"
fi

echo ""

# ---- 4. Node.js & npm ----
echo "[4/6] Checking Node.js & npm..."
if command -v node &>/dev/null; then
  NODE_VER=$(node --version)
  echo -e "  $PASS Node.js: $NODE_VER"
else
  echo -e "  $FAIL Node.js not found! Install from https://nodejs.org"
  errors=$((errors + 1))
fi

if command -v npm &>/dev/null; then
  NPM_VER=$(npm --version)
  echo -e "  $PASS npm: $NPM_VER"
else
  echo -e "  $FAIL npm not found!"
  errors=$((errors + 1))
fi

echo ""

# ---- 5. node_modules installed ----
echo "[5/6] Checking dependencies installed..."
if [ -d "$ROOT_DIR/node_modules" ]; then
  echo -e "  $PASS Root node_modules present"
else
  echo -e "  $WARN Root node_modules missing — run: npm install"
  errors=$((errors + 1))
fi

if [ -d "$ROOT_DIR/apps/frontend/node_modules" ]; then
  echo -e "  $PASS Frontend node_modules present"
else
  echo -e "  $WARN Frontend node_modules missing — run: npm install inside apps/frontend"
fi

if [ -d "$ROOT_DIR/apps/backend/node_modules" ]; then
  echo -e "  $PASS Backend node_modules present"
else
  echo -e "  $WARN Backend node_modules missing — run: npm install inside apps/backend"
fi

echo ""

# ---- 6. Backend health check ----
echo "[6/6] Checking backend health..."
BACKEND_URL=$(grep -E "^EXPO_PUBLIC_BACKEND_URL=" "$ROOT_DIR/.env" 2>/dev/null | cut -d '=' -f2-)

if [ -z "$BACKEND_URL" ] || [[ "$BACKEND_URL" == *"xxxxx"* ]] || [[ "$BACKEND_URL" == *"your_"* ]]; then
  echo -e "  $WARN EXPO_PUBLIC_BACKEND_URL not set — skipping health check"
  echo -e "  $INFO Deploy backend first: npm run setup:gcloud"
else
  echo -e "  $INFO Pinging $BACKEND_URL/api/health ..."
  if command -v curl &>/dev/null; then
    HTTP_CODE=$(curl -s -o /tmp/votexa-health.json -w "%{http_code}" --max-time 10 "$BACKEND_URL/api/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
      HEALTH_BODY=$(cat /tmp/votexa-health.json 2>/dev/null)
      echo -e "  $PASS Backend is alive! Response: $HEALTH_BODY"
    elif [ "$HTTP_CODE" = "000" ]; then
      echo -e "  $FAIL Could not reach backend (connection refused or timeout)"
      echo -e "  $INFO Run: npm run dev:backend  (for local) or npm run setup:gcloud (for Cloud Run)"
      errors=$((errors + 1))
    else
      echo -e "  $FAIL Backend returned HTTP $HTTP_CODE"
      errors=$((errors + 1))
    fi
  else
    echo -e "  $WARN curl not found — install curl to test health check"
  fi
fi

echo ""
echo "=========================================="

if [ "$errors" -eq 0 ]; then
  echo -e "$PASS All checks passed! You're ready to run Votexa."
  echo ""
  echo "  Start the app:"
  echo "    Windows → double-click fix.bat"
  echo "    Mac/Linux → bash fix.sh"
  echo ""
  echo "  Or individually:"
  echo "    npm run dev:backend    (backend on port 8080)"
  echo "    npm run dev:frontend   (Expo QR code for phone)"
else
  echo -e "$FAIL $errors check(s) failed. Fix the issues above and re-run:"
  echo "    bash scripts/verify-setup.sh"
fi

echo "=========================================="
echo ""

exit $errors
