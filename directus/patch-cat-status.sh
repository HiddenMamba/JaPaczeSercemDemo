#!/bin/bash
# ── Remove reserved from cats.status on an existing Directus instance ──────────
# Usage:
#   DIRECTUS_URL=http://localhost:8055 \
#   DIRECTUS_EMAIL=admin@example.com \
#   DIRECTUS_PASSWORD=admin123 \
#   bash directus/patch-cat-status.sh
#
# For fresh installs, schema-snapshot.json already includes the cleaned status list.

set -e

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

echo ""
echo "🐱 Patch cats.status - remove reserved"
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

CHOICES='{"choices":[{"text":"Dostępny","value":"available"},{"text":"W trakcie leczenia","value":"inTreatment"},{"text":"Adoptowany","value":"adopted"},{"text":"Za tęczowym mostem","value":"rainbow"}]}'

RESULT=$(curl -s -X PATCH "$DIRECTUS_URL/fields/cats/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"meta\":{\"display\":\"labels\",\"options\":$CHOICES}}")

if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
  echo "✅ cats.status choices updated (reserved removed)"
else
  echo "❌ Update failed: $RESULT"
  exit 1
fi

RESERVED_IDS=$(curl -g -s "$DIRECTUS_URL/items/cats?filter[status][_eq]=reserved&fields=id&limit=-1" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; data=json.load(sys.stdin).get('data',[]); print(' '.join(item['id'] for item in data if item.get('id')))" 2>/dev/null)

if [ -n "$RESERVED_IDS" ]; then
  for CAT_ID in $RESERVED_IDS; do
    UPDATE_RESULT=$(curl -s -X PATCH "$DIRECTUS_URL/items/cats/$CAT_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status":"available"}')

    if echo "$UPDATE_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
      echo "✅ Cat $CAT_ID moved from reserved to available"
    else
      echo "❌ Could not update cat $CAT_ID: $UPDATE_RESULT"
      exit 1
    fi
  done
else
  echo "ℹ No cats with reserved status found"
fi

echo ""
