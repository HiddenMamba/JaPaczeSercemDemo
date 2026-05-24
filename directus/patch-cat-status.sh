#!/bin/bash
# ── Add inTreatment to cats.status dropdown on an existing Directus instance ──
# Usage:
#   DIRECTUS_URL=http://localhost:8055 \
#   DIRECTUS_EMAIL=admin@example.com \
#   DIRECTUS_PASSWORD=admin123 \
#   bash directus/patch-cat-status.sh
#
# For fresh installs, schema-snapshot.json already includes inTreatment.

set -e

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

echo ""
echo "🐱 Patch cats.status — add inTreatment"
echo "   Target: $DIRECTUS_URL"
echo ""

TOKEN=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DIRECTUS_EMAIL\",\"password\":\"$DIRECTUS_PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Could not authenticate"
  exit 1
fi
echo "✅ Authenticated"

CHOICES='{"choices":[{"text":"Dostępny","value":"available"},{"text":"W trakcie leczenia","value":"inTreatment"},{"text":"Zarezerwowany","value":"reserved"},{"text":"Adoptowany","value":"adopted"},{"text":"Za tęczowym mostem","value":"rainbow"}]}'

RESULT=$(curl -s -X PATCH "$DIRECTUS_URL/fields/cats/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"meta\":{\"options\":$CHOICES}}")

if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
  echo "✅ cats.status choices updated (inTreatment added)"
else
  echo "❌ Update failed: $RESULT"
  exit 1
fi

echo ""
