#!/usr/bin/env bash
# =============================================================================
# directus/patch-page-style.sh
#
# Safe incremental patch for existing Directus instances.
# Adds the page_style collection + fields + permissions WITHOUT touching
# existing collections, data, or permissions.
#
# Also updates cat_traits.icon to the emoji dropdown interface.
#
# Usage (local):
#   DIRECTUS_URL=http://localhost:8055 \
#   DIRECTUS_EMAIL=admin@example.com \
#   DIRECTUS_PASSWORD=admin123 \
#   bash directus/patch-page-style.sh
#
# Usage (Render / production):
#   bash directus/run-render.sh   → choose option 4
# =============================================================================

set -euo pipefail

BASE_URL="${DIRECTUS_URL:-http://localhost:8055}"
EMAIL="${DIRECTUS_EMAIL:-admin@example.com}"
PASSWORD="${DIRECTUS_PASSWORD:-admin123}"

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ~ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }

echo ""
echo "🎨 patch-page-style.sh"
echo "   Target: $BASE_URL"
echo ""

# ── Auth ──────────────────────────────────────────────────────────────────────
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['access_token'])" 2>/dev/null)
[ -z "$TOKEN" ] && { fail "Login failed. Check DIRECTUS_EMAIL / DIRECTUS_PASSWORD."; exit 1; }
ok "Authenticated as $EMAIL"

api() { curl -s -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }

# Headings now always use Amatic SC in the frontend. Directus only controls the
# base body text size via page_style.base_font_size.

EMOJI_CHOICES='[
  {"text":"🐾 Ogólne","value":"🐾"},{"text":"❤️ Łagodny","value":"❤️"},
  {"text":"⭐ Wyjątkowy","value":"⭐"},{"text":"🏠 Tylko dom","value":"🏠"},
  {"text":"🌿 Spokojny","value":"🌿"},{"text":"👁️ Jednooki","value":"👁️"},
  {"text":"🦯 Ślepy","value":"🦯"},{"text":"🔇 Głuchy","value":"🔇"},
  {"text":"🦠 FIV+","value":"🦠"},{"text":"🩸 FeLV+","value":"🩸"},
  {"text":"💊 Leczenie przewlekłe","value":"💊"},{"text":"🍽️ Dieta specjalna","value":"🍽️"},
  {"text":"🏥 Po operacji","value":"🏥"},{"text":"🩺 Pod opieką wet.","value":"🩺"},
  {"text":"♀️ Kotka","value":"♀️"},{"text":"♂️ Kocur","value":"♂️"},
  {"text":"👶 Przyjazny dzieciom","value":"👶"},{"text":"🐶 Przyjazny psom","value":"🐶"},
  {"text":"🐱 Przyjazny kotom","value":"🐱"},{"text":"🫣 Nieśmiały","value":"🫣"},
  {"text":"🌈 Za tęczowym mostem","value":"🌈"},{"text":"🎀 Senior","value":"🎀"},
  {"text":"🐣 Kocię","value":"🐣"},{"text":"🛋️ Kanapowiec","value":"🛋️"},
  {"text":"🌙 Nocny marek","value":"🌙"},{"text":"🎾 Aktywny","value":"🎾"},
  {"text":"🤗 Towarzyski","value":"🤗"},{"text":"😿 Wymaga cierpliwości","value":"😿"},
  {"text":"✂️ Wykastrowany","value":"✂️"},{"text":"💉 Szczepiony","value":"💉"},
  {"text":"🏷️ Zaczipowany","value":"🏷️"}
]'

# Helper: add a field if it doesn't already exist
add_field() {
  local COLLECTION="$1"
  local FIELD="$2"
  local PAYLOAD="$3"

  EXISTS=$(api "$BASE_URL/fields/$COLLECTION/$FIELD" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

  if [ "$EXISTS" = "yes" ]; then
    warn "$COLLECTION.$FIELD already exists — skipping"
  else
    RESULT=$(api -X POST "$BASE_URL/fields/$COLLECTION" -d "$PAYLOAD")
    if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
      ok "$COLLECTION.$FIELD created"
    else
      ERR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)
      fail "$COLLECTION.$FIELD failed: $ERR"
    fi
  fi
}

delete_field() {
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
    fail "$COLLECTION.$FIELD failed: $ERR"
  fi
}

# ── 1. Create page_style collection ──────────────────────────────────────────
echo ""
echo "=== 1. page_style collection ==="

COL_EXISTS=$(api "$BASE_URL/collections/page_style" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'data' in d else 'no')" 2>/dev/null)

if [ "$COL_EXISTS" = "yes" ]; then
  warn "page_style collection already exists — skipping"
else
  RESULT=$(api -X POST "$BASE_URL/collections" -d '{
    "collection": "page_style",
    "meta": {
      "icon": "palette",
      "note": "Styl strony – kolory i podstawowa typografia (singleton)",
      "display_template": "Styl strony",
      "singleton": true,
      "translations": [{"language":"pl-PL","translation":"Styl strony"}]
    },
    "schema": { "name": "page_style" }
  }')
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "page_style collection created"
  else
    fail "page_style collection: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
    exit 1
  fi
fi

# ── 2. Add page_style fields ──────────────────────────────────────────────────
echo ""
echo "=== 2. page_style fields ==="

add_field "page_style" "primary_color" '{
  "field":"primary_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Główny kolor marki – przyciski, akcenty","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor główny"}]}}'

add_field "page_style" "secondary_color" '{
  "field":"secondary_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Kolor pomocniczy – tła sekcji","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor pomocniczy"}]}}'

add_field "page_style" "accent_color" '{
  "field":"accent_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Kolor akcentu – hover, ramki","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor akcentu"}]}}'

add_field "page_style" "background_color" '{
  "field":"background_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Kolor tła strony","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor tła"}]}}'

add_field "page_style" "text_color" '{
  "field":"text_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Kolor tekstu","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor tekstu"}]}}'

add_field "page_style" "nav_background_color" '{
  "field":"nav_background_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Kolor tła nawigacji","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor tła nawigacji"}]}}'

add_field "page_style" "footer_background_color" '{
  "field":"footer_background_color","type":"string","schema":{"is_nullable":true},
  "meta":{"interface":"select-color","note":"Kolor tła stopki","width":"half",
  "translations":[{"language":"pl-PL","translation":"Kolor tła stopki"}]}}'

delete_field "page_style" "page_font"
delete_field "page_style" "heading_font"
delete_field "page_style" "nav_font"

add_field "page_style" "base_font_size" '{
  "field":"base_font_size","type":"integer","schema":{"is_nullable":true,"default_value":16},
  "meta":{"interface":"input-integer",
  "note":"Bazowy rozmiar tekstu strony w px (nagłówki pozostają w Amatic SC).","width":"half",
  "translations":[{"language":"pl-PL","translation":"Bazowy rozmiar tekstu (px)"}]}}'


# ── 3. Seed page_style singleton with defaults ────────────────────────────────
echo ""
echo "=== 3. Seed page_style defaults ==="

HAS_DATA=$(api "$BASE_URL/items/page_style" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'data' not in d: print('error'); sys.exit()
data=d['data']
print('exists' if (isinstance(data,dict) and data.get('id')) or (isinstance(data,list) and data) else 'empty')
" 2>/dev/null)

if [ "$HAS_DATA" = "exists" ]; then
  warn "page_style record already exists — skipping seed"
else
  RESULT=$(api -X PATCH "$BASE_URL/items/page_style" -d '{
    "base_font_size": 16
  }')
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "page_style defaults seeded"
  else
    fail "page_style seed failed: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
  fi
fi

# ── 4. Update cat_traits.icon to emoji dropdown ───────────────────────────────
echo ""
echo "=== 4. cat_traits.icon → emoji dropdown ==="

RESULT=$(api -X PATCH "$BASE_URL/fields/cat_traits/icon" -d "{
  \"meta\": {
    \"interface\": \"select-dropdown\",
    \"options\": {\"choices\": $EMOJI_CHOICES, \"allowOther\": true},
    \"note\": \"Wybierz emoji z listy lub wpisz własne\",
    \"width\": \"half\",
    \"translations\": [{\"language\":\"pl-PL\",\"translation\":\"Ikona (emoji)\"}]
  }
}")
if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
  ok "cat_traits.icon updated to emoji dropdown"
else
  fail "cat_traits.icon: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
fi

# ── 5. Grant public read on page_style ───────────────────────────────────────
echo ""
echo "=== 5. Public read permission for page_style ==="

# Find the public policy (non-admin policy)
PUBLIC_POLICY=$(api "$BASE_URL/policies?fields=id,name,admin_access&limit=20" \
  | python3 -c "
import sys,json
d=json.load(sys.stdin)
pols=[p for p in d.get('data',[]) if not p.get('admin_access')]
print(pols[0]['id'] if pols else '')
" 2>/dev/null)

if [ -z "$PUBLIC_POLICY" ]; then
  fail "Could not find public policy — grant permission manually in Directus admin"
else
  ok "Public policy: $PUBLIC_POLICY"
  RESULT=$(api -X POST "$BASE_URL/permissions" -d "{
    \"policy\":\"$PUBLIC_POLICY\",
    \"collection\":\"page_style\",
    \"action\":\"read\",
    \"fields\":[\"*\"]
  }")
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    ok "Public read granted on page_style"
  else
    warn "Permission may already exist: $(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)"
  fi
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}=== Done! ===${NC}"
echo "  page_style collection created + seeded with defaults"
echo "  cat_traits.icon now shows emoji picker"
echo ""
echo "  Next steps:"
echo "  1. Deploy your updated frontend (Vercel will auto-deploy from git)"
echo "  2. Go to Directus admin → Styl strony to set colours and base text size"
