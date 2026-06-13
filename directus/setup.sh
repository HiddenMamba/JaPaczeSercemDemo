#!/usr/bin/env bash
# =============================================================================
# directus/setup.sh
# Full one-shot setup: schema → extra fields → permissions → seed data
#
# Usage:
#   DIRECTUS_EMAIL=admin@example.com DIRECTUS_PASSWORD=admin123 ./directus/setup.sh
#   (or set DIRECTUS_URL if not http://localhost:8055)
#
# Run this ONCE after a fresh `docker compose up`.
# After that, use seed.sh to re-seed data only.
# =============================================================================

set -euo pipefail

BASE_URL="${DIRECTUS_URL:-http://localhost:8055}"
EMAIL="${DIRECTUS_EMAIL:-admin@example.com}"
PASSWORD="${DIRECTUS_PASSWORD:-admin123}"
PUBLIC_POLICY="abf8a154-5b1c-4a46-ac9c-7300570f4f17"

# Colours
GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ~ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }

# ── 1. Login ──────────────────────────────────────────────────────────────────
echo ""
echo "=== 1. Authenticating ==="
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['access_token'])" 2>/dev/null)
[ -z "$TOKEN" ] && { fail "Login failed. Check EMAIL/PASSWORD."; exit 1; }
ok "Authenticated as $EMAIL"

AUTH="-H \"Authorization: Bearer $TOKEN\""

api() {
  curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"
}

# ── 2. Apply schema (collections + fields + relations) ────────────────────────
echo ""
echo "=== 2. Applying schema snapshot ==="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SNAPSHOT="$SCRIPT_DIR/schema-snapshot.json"

# Check how many user collections already exist
EXISTING_COLS=$(api "$BASE_URL/collections" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); cols=[c for c in d.get('data',[]) if not c['collection'].startswith('directus_')]; print(len(cols))" 2>/dev/null || echo "0")

echo "  Existing user collections: $EXISTING_COLS"

if [ "${EXISTING_COLS:-0}" -ge 10 ]; then
  warn "Collections already exist ($EXISTING_COLS found) – skipping schema/apply to preserve data"
  warn "To force re-apply, run: docker compose down -v && docker compose up -d && ./directus/setup.sh"
else
  # Get diff
  api -X POST "$BASE_URL/schema/diff" -d @"$SNAPSHOT" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d['data']))" \
    > /tmp/_directus_apply.json

  COL_COUNT=$(python3 -c "import json; d=json.load(open('/tmp/_directus_apply.json')); print(len(d['diff']['collections']))")
  FIELD_COUNT=$(python3 -c "import json; d=json.load(open('/tmp/_directus_apply.json')); print(len(d['diff']['fields']))")

  # Safety check: refuse to apply if diff wants to DELETE collections
  DEL_COUNT=$(python3 -c "
import json
d=json.load(open('/tmp/_directus_apply.json'))
dels=[c for c in d['diff']['collections'] if any(x.get('kind')=='D' for x in c.get('diff',[]))]
print(len(dels))
" 2>/dev/null || echo "0")

  if [ "${DEL_COUNT:-0}" -gt 0 ]; then
    fail "Schema diff wants to DELETE $DEL_COUNT collections — aborting to prevent data loss!"
    fail "This usually means Directus metadata is out of sync. Do a full reset:"
    fail "  docker compose down -v && docker compose up -d && ./directus/setup.sh"
    exit 1
  fi

  if [ "$COL_COUNT" -eq 0 ] && [ "$FIELD_COUNT" -eq 0 ]; then
    warn "Schema already up to date – skipping apply"
  else
    HTTP=$(curl -s -o /tmp/_apply_result.json -w "%{http_code}" \
      -X POST "$BASE_URL/schema/apply" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @/tmp/_directus_apply.json)
    if [ "$HTTP" = "204" ] || [ "$HTTP" = "200" ]; then
      ok "Schema applied ($COL_COUNT collection diffs, $FIELD_COUNT field diffs)"
    else
      fail "Schema apply failed (HTTP $HTTP): $(cat /tmp/_apply_result.json)"
      exit 1
    fi
  fi

  sleep 2  # Give Directus a moment to register the new collections
fi

# ── 3. Add any fields that schema/apply may miss ──────────────────────────────
echo ""
echo "=== 3. Ensuring individual fields exist ==="

add_field_if_missing() {
  local COLLECTION="$1"
  local FIELD="$2"
  local PAYLOAD="$3"

  EXISTS=$(api "$BASE_URL/fields/$COLLECTION/$FIELD" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

  if [ "$EXISTS" = "yes" ]; then
    warn "$COLLECTION.$FIELD already exists"
  else
    RESULT=$(api -X POST "$BASE_URL/fields/$COLLECTION" -d "$PAYLOAD")
    if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
      ok "$COLLECTION.$FIELD created"
    else
      ERR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)
      fail "$COLLECTION.$FIELD: $ERR"
    fi
  fi
}

delete_field_if_exists() {
  local COLLECTION="$1"
  local FIELD="$2"

  EXISTS=$(api "$BASE_URL/fields/$COLLECTION/$FIELD" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

  if [ "$EXISTS" != "yes" ]; then
    warn "$COLLECTION.$FIELD already removed"
    return
  fi

  RESULT=$(api -X DELETE "$BASE_URL/fields/$COLLECTION/$FIELD")
  if [ -z "$RESULT" ] || echo "$RESULT" | python3 -c "import sys,json; import sys as _s; txt=_s.stdin.read().strip(); exit(0 if txt in ('', 'null') else (0 if json.loads(txt).get('data') is not None else 1))" 2>/dev/null; then
    ok "$COLLECTION.$FIELD removed"
  else
    ERR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)
    fail "$COLLECTION.$FIELD: $ERR"
  fi
}

# Remove legacy font pickers from older installs.
delete_field_if_exists "page_style" "page_font"
delete_field_if_exists "page_style" "heading_font"
delete_field_if_exists "page_style" "nav_font"

# page_style.base_font_size
add_field_if_missing "page_style" "base_font_size" '{
  "field": "base_font_size",
  "type": "integer",
  "schema": { "is_nullable": true, "default_value": 16 },
  "meta": {
    "interface": "input-integer",
    "note": "Bazowy rozmiar tekstu strony w px (nag\u0142\u00f3wki pozostaj\u0105 w Amatic SC)",
    "width": "half",
    "translations": [{"language":"pl-PL","translation":"Bazowy rozmiar tekstu (px)"}]
  }
}'

# site_settings.not_found_image
add_field_if_missing "site_settings" "not_found_image" '{
  "field": "not_found_image",
  "type": "uuid",
  "schema": {
    "is_nullable": true,
    "foreign_key_table": "directus_files",
    "foreign_key_column": "id"
  },
  "meta": {
    "interface": "file-image",
    "note": "Opcjonalny obrazek na stronę 404 - gdy pusty, pozostaje domyślne emoji",
    "translations": [{"language":"pl-PL","translation":"Obrazek strony 404"}]
  }
}'

# ── 4. Grant public read permissions ─────────────────────────────────────────
echo ""
echo "=== 4. Granting public read permissions ==="

COLLECTIONS=(
  directus_files cats cats_files cats_traits cat_traits forever_home_photos
  news pages menu_items social_links site_settings
  adoption_questions support_methods partners documents page_style
)

# Build batch payload
PAYLOAD="["
FIRST=1
for COL in "${COLLECTIONS[@]}"; do
  [ $FIRST -eq 0 ] && PAYLOAD="$PAYLOAD,"
  PAYLOAD="$PAYLOAD{\"policy\":\"$PUBLIC_POLICY\",\"collection\":\"$COL\",\"action\":\"read\",\"fields\":[\"*\"]}"
  FIRST=0
done
PAYLOAD="$PAYLOAD]"

RESULT=$(api -X POST "$BASE_URL/permissions" -d "$PAYLOAD")
COUNT=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])) if 'data' in d else 0)" 2>/dev/null)
if [ "${COUNT:-0}" -gt 0 ]; then
  ok "$COUNT public read permissions granted"
else
  warn "Permissions may already exist or batch failed – $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
fi

# ── 5. Verify public access ───────────────────────────────────────────────────
echo ""
echo "=== 5. Verifying public access ==="
sleep 1
CATS_RESULT=$(curl -s "$BASE_URL/items/cats?limit=1&fields=id")
if echo "$CATS_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
  ok "Public access to 'cats' works"
else
  fail "Public access still blocked: $(echo "$CATS_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
fi

# ── 6. Seed singleton data ────────────────────────────────────────────────────
echo ""
echo "=== 6. Seeding singleton data ==="

# Helper: upsert a singleton (Directus 11: PATCH /items/collection creates-or-updates)
upsert_singleton() {
  local COLLECTION="$1"
  local DATA="$2"

  # In Directus 11, PATCH on a singleton always works whether record exists or not
  RESULT=$(api -X PATCH "$BASE_URL/items/$COLLECTION" -d "$DATA")

  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "$COLLECTION seeded"
  else
    ERR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)
    fail "$COLLECTION failed: $ERR"
  fi
}

upsert_singleton "site_settings" '{
  "site_name": "Ja Pacze Sercem",
  "tagline": "Daj kotu dom na zawsze",
  "banner_enabled": false,
  "banner_color": "orange",
  "cats_adopted_before_website": 47,
  "contact_form_enabled": true,
  "contact_email_visible": false,
  "founded_year": 2020
}'

upsert_singleton "page_style" '{
  "base_font_size": 16
}'

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}=== Setup complete! ===${NC}"
echo "  🎛️  Directus admin: $BASE_URL/admin"
echo "  📧 Login:          $EMAIL / $PASSWORD"
echo ""
echo "  Next: run ./directus/seed.sh to add sample content"
