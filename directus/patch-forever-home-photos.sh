#!/usr/bin/env bash
# ── Add forever_home_photos collection on an existing Directus instance ───────
# Usage:
#   DIRECTUS_URL=http://localhost:8055 \
#   DIRECTUS_EMAIL=admin@example.com \
#   DIRECTUS_PASSWORD=admin123 \
#   bash directus/patch-forever-home-photos.sh

set -euo pipefail

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ~ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }

echo ""
echo "🏠 Patch forever_home_photos"
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

delete_field() {
  local COLLECTION="$1"
  local FIELD="$2"

  EXISTS=$(api "$DIRECTUS_URL/fields/$COLLECTION/$FIELD" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

  if [ "$EXISTS" != "yes" ]; then
    warn "$COLLECTION.$FIELD already removed"
    return
  fi

  RESULT=$(api -X DELETE "$DIRECTUS_URL/fields/$COLLECTION/$FIELD")
  if [ -z "$RESULT" ] || echo "$RESULT" | python3 -c "import sys,json; import sys as _s; txt=_s.stdin.read().strip(); exit(0 if txt in ('', 'null') else (0 if json.loads(txt).get('data') is not None else 1))" 2>/dev/null; then
    ok "$COLLECTION.$FIELD removed"
  else
    fail "$COLLECTION.$FIELD remove failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
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
      \"schema\":{
        \"on_delete\":\"$ON_DELETE\"
      },
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
      \"schema\":{
        \"on_delete\":\"$ON_DELETE\"
      },
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

patch_collection() {
  RESULT=$(api -X PATCH "$DIRECTUS_URL/collections/forever_home_photos" -d '{
    "meta": {
      "icon": "home",
      "note": "Zdjęcia kotów w domach stałych",
      "display_template": "{{caption}}",
      "sort_field": null
    }
  }')
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "forever_home_photos collection updated"
  else
    fail "forever_home_photos collection update failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
    exit 1
  fi
}

COL_EXISTS=$(api "$DIRECTUS_URL/collections/forever_home_photos" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

if [ "$COL_EXISTS" = "yes" ]; then
  warn "forever_home_photos collection already exists"
else
  RESULT=$(api -X POST "$DIRECTUS_URL/collections" -d '{
    "collection": "forever_home_photos",
    "meta": {
      "icon": "home",
      "note": "Zdjęcia kotów w domach stałych",
      "display_template": "{{caption}}",
      "sort_field": null
    },
    "schema": { "name": "forever_home_photos" }
  }')
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "forever_home_photos collection created"
  else
    fail "forever_home_photos collection failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
    exit 1
  fi
fi

patch_collection

add_field "forever_home_photos" "cat" '{
  "field":"cat","type":"uuid",
  "schema":{"is_nullable":true,"foreign_key_table":"cats","foreign_key_column":"id"},
  "meta":{"interface":"select-dropdown-m2o","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kot"}]}
}'
patch_field "forever_home_photos" "cat" '{
  "schema":{"is_nullable":true},
  "meta":{"interface":"select-dropdown-m2o","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kot"}]}
}'

add_field "forever_home_photos" "photo" '{
  "field":"photo","type":"uuid",
  "schema":{"is_nullable":true,"foreign_key_table":"directus_files","foreign_key_column":"id"},
  "meta":{"interface":"file-image","width":"half",
  "translations":[{"language":"pl-PL","translation":"Zdjęcie"}]}
}'
patch_field "forever_home_photos" "photo" '{
  "schema":{"is_nullable":true},
  "meta":{"interface":"file-image","width":"half",
  "translations":[{"language":"pl-PL","translation":"Zdjęcie"}]}
}'

add_field "forever_home_photos" "caption" '{
  "field":"caption","type":"string",
  "schema":{"is_nullable":true},
  "meta":{"interface":"input",
  "translations":[{"language":"pl-PL","translation":"Podpis"}]}
}'
patch_field "forever_home_photos" "caption" '{
  "meta":{"interface":"input",
  "translations":[{"language":"pl-PL","translation":"Podpis"}]}
}'

add_field "forever_home_photos" "published_at" '{
  "field":"published_at","type":"timestamp",
  "schema":{"is_nullable":true},
  "meta":{"interface":"datetime","width":"half",
  "translations":[{"language":"pl-PL","translation":"Data publikacji"}]}
}'
patch_field "forever_home_photos" "published_at" '{
  "schema":{"is_nullable":true,"default_value":null},
  "meta":{"interface":"datetime","width":"half",
  "translations":[{"language":"pl-PL","translation":"Data publikacji"}]}
}'

delete_field "forever_home_photos" "sort"

ensure_relation "forever_home_photos" "cat" "cats" "SET NULL"
ensure_relation "forever_home_photos" "photo" "directus_files" "SET NULL"

PUBLIC_POLICY=$(api "$DIRECTUS_URL/policies?fields=id,name,admin_access&limit=20" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); pols=[p for p in d.get('data',[]) if not p.get('admin_access')]; print(pols[0]['id'] if pols else '')" 2>/dev/null)

if [ -z "$PUBLIC_POLICY" ]; then
  warn "Could not find public policy - grant forever_home_photos read permission manually"
else
  RESULT=$(api -X POST "$DIRECTUS_URL/permissions" -d "{
    \"policy\":\"$PUBLIC_POLICY\",
    \"collection\":\"forever_home_photos\",
    \"action\":\"read\",
    \"fields\":[\"*\"]
  }")
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "Public read granted on forever_home_photos"
  else
    warn "Permission may already exist: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
  fi
fi

echo ""
echo -e "${GREEN}=== Done! ===${NC}"
echo "  forever_home_photos collection is ready"
echo "  Run bash directus/patch-labels.sh if you want Polish labels refreshed"
echo ""
