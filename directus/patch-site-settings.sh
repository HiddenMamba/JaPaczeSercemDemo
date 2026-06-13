#!/usr/bin/env bash
# ── Patch site_settings on an existing Directus instance ──────────────────────
# Adds newer optional fields without touching existing content.
#
# Usage:
#   DIRECTUS_URL=https://your-cms.onrender.com \
#   DIRECTUS_EMAIL=you@email.com \
#   DIRECTUS_PASSWORD=yourpass \
#   bash directus/patch-site-settings.sh

set -euo pipefail

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ~ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }

echo ""
echo "⚙️ Patch site_settings"
echo "   Target: $DIRECTUS_URL"
echo ""

TOKEN=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DIRECTUS_EMAIL\",\"password\":\"$DIRECTUS_PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  fail "Could not authenticate"
  exit 1
fi
ok "Authenticated"

api() {
  curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"
}

add_field() {
  local COLLECTION="$1"
  local FIELD="$2"
  local PAYLOAD="$3"

  EXISTS=$(api "$DIRECTUS_URL/fields/$COLLECTION/$FIELD" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

  if [ "$EXISTS" = "yes" ]; then
    warn "$COLLECTION.$FIELD already exists"
    return
  fi

  RESULT=$(api -X POST "$DIRECTUS_URL/fields/$COLLECTION" -d "$PAYLOAD")
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "$COLLECTION.$FIELD created"
  else
    fail "$COLLECTION.$FIELD failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
    exit 1
  fi
}

patch_field() {
  local COLLECTION="$1"
  local FIELD="$2"
  local PAYLOAD="$3"

  RESULT=$(api -X PATCH "$DIRECTUS_URL/fields/$COLLECTION/$FIELD" -d "$PAYLOAD")
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "$COLLECTION.$FIELD updated"
  else
    fail "$COLLECTION.$FIELD update failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
    exit 1
  fi
}

ensure_relation() {
  local COLLECTION="$1"
  local FIELD="$2"
  local RELATED="$3"
  local ON_DELETE="$4"

  EXISTS=$(api "$DIRECTUS_URL/relations/$COLLECTION/$FIELD" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

  if [ "$EXISTS" = "yes" ]; then
    RESULT=$(api -X PATCH "$DIRECTUS_URL/relations/$COLLECTION/$FIELD" -d "{
      \"collection\":\"$COLLECTION\",
      \"field\":\"$FIELD\",
      \"related_collection\":\"$RELATED\",
      \"schema\":{\"on_delete\":\"$ON_DELETE\"},
      \"meta\":{
        \"many_collection\":\"$COLLECTION\",
        \"many_field\":\"$FIELD\",
        \"one_collection\":\"$RELATED\",
        \"one_field\":null,
        \"one_collection_field\":null,
        \"one_allowed_collections\":null,
        \"junction_field\":null,
        \"sort_field\":null,
        \"one_deselect_action\":\"nullify\"
      }
    }")
    ACTION="updated"
  else
    RESULT=$(api -X POST "$DIRECTUS_URL/relations" -d "{
      \"collection\":\"$COLLECTION\",
      \"field\":\"$FIELD\",
      \"related_collection\":\"$RELATED\",
      \"schema\":{\"on_delete\":\"$ON_DELETE\"},
      \"meta\":{
        \"many_collection\":\"$COLLECTION\",
        \"many_field\":\"$FIELD\",
        \"one_collection\":\"$RELATED\",
        \"one_field\":null,
        \"one_collection_field\":null,
        \"one_allowed_collections\":null,
        \"junction_field\":null,
        \"sort_field\":null,
        \"one_deselect_action\":\"nullify\"
      }
    }")
    ACTION="created"
  fi

  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "$COLLECTION.$FIELD relation $ACTION"
  else
    fail "$COLLECTION.$FIELD relation failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
    exit 1
  fi
}

add_field "site_settings" "not_found_image" '{
  "field":"not_found_image","type":"uuid",
  "schema":{"is_nullable":true,"foreign_key_table":"directus_files","foreign_key_column":"id"},
  "meta":{"interface":"file-image",
  "note":"Opcjonalny obrazek na stronę 404 - gdy pusty, pozostaje domyślne emoji",
  "translations":[{"language":"pl-PL","translation":"Obrazek strony 404"}]}
}'

patch_field "site_settings" "not_found_image" '{
  "schema":{"is_nullable":true},
  "meta":{"interface":"file-image",
  "note":"Opcjonalny obrazek na stronę 404 - gdy pusty, pozostaje domyślne emoji",
  "translations":[{"language":"pl-PL","translation":"Obrazek strony 404"}]}
}'

ensure_relation "site_settings" "not_found_image" "directus_files" "SET NULL"

echo ""
echo -e "${GREEN}=== Done! ===${NC}"
echo "  site_settings is updated"
echo "  Run bash directus/patch-labels.sh if you want labels refreshed"
echo ""
