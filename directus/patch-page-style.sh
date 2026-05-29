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

# ── Shared font choices list ──────────────────────────────────────────────────
FONT_CHOICES='[
  {"text":"(taka sama jak czcionka strony)","value":""},
  {"text":"Amatic SC","value":"Amatic SC"},
  {"text":"Lato","value":"Lato"},
  {"text":"Roboto","value":"Roboto"},
  {"text":"Open Sans","value":"Open Sans"},
  {"text":"Nunito","value":"Nunito"},
  {"text":"Playfair Display","value":"Playfair Display"},
  {"text":"Merriweather","value":"Merriweather"},
  {"text":"Montserrat","value":"Montserrat"},
  {"text":"Poppins","value":"Poppins"},
  {"text":"Raleway","value":"Raleway"},
  {"text":"Dancing Script","value":"Dancing Script"},
  {"text":"Pacifico","value":"Pacifico"},
  {"text":"Lobster","value":"Lobster"},
  {"text":"Quicksand","value":"Quicksand"},
  {"text":"Josefin Sans","value":"Josefin Sans"},
  {"text":"Caveat","value":"Caveat"},
  {"text":"Permanent Marker","value":"Permanent Marker"},
  {"text":"Comfortaa","value":"Comfortaa"},
  {"text":"Ubuntu","value":"Ubuntu"},
  {"text":"Inter","value":"Inter"},
  {"text":"DM Sans","value":"DM Sans"},
  {"text":"Outfit","value":"Outfit"},
  {"text":"Libre Baskerville","value":"Libre Baskerville"},
  {"text":"Source Serif 4","value":"Source Serif 4"}
]'

SIZE_CHOICES='[
  {"text":"12px – bardzo mały","value":"12"},
  {"text":"13px – mały","value":"13"},
  {"text":"14px – trochę mały","value":"14"},
  {"text":"15px – prawie domyślny","value":"15"},
  {"text":"16px – domyślny (zalecany)","value":"16"},
  {"text":"17px – trochę większy","value":"17"},
  {"text":"18px – większy","value":"18"},
  {"text":"19px – duży","value":"19"},
  {"text":"20px – bardzo duży","value":"20"},
  {"text":"22px – ekstra duży","value":"22"},
  {"text":"24px – maksymalny","value":"24"}
]'

NAV_SIZE_CHOICES='[
  {"text":"12px","value":"12"},
  {"text":"13px","value":"13"},
  {"text":"14px – domyślny","value":"14"},
  {"text":"15px","value":"15"},
  {"text":"16px","value":"16"},
  {"text":"17px","value":"17"},
  {"text":"18px","value":"18"}
]'

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
      "note": "Styl strony – kolory i czcionka (singleton)",
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

add_field "page_style" "page_font" "{
  \"field\":\"page_font\",\"type\":\"string\",\"schema\":{\"is_nullable\":true},
  \"meta\":{\"interface\":\"select-dropdown\",\"options\":{\"choices\":$FONT_CHOICES,\"allowOther\":true},
  \"note\":\"Czcionka strony (Google Fonts). Puste = czcionka systemowa.\",
  \"translations\":[{\"language\":\"pl-PL\",\"translation\":\"Czcionka strony\"}]}}"

add_field "page_style" "heading_font" "{
  \"field\":\"heading_font\",\"type\":\"string\",\"schema\":{\"is_nullable\":true},
  \"meta\":{\"interface\":\"select-dropdown\",\"options\":{\"choices\":$FONT_CHOICES,\"allowOther\":true},
  \"note\":\"Czcionka nagłówków. Puste = taka sama jak czcionka strony.\",
  \"translations\":[{\"language\":\"pl-PL\",\"translation\":\"Czcionka nagłówków\"}]}}"

add_field "page_style" "base_font_size" "{
  \"field\":\"base_font_size\",\"type\":\"string\",\"schema\":{\"is_nullable\":true,\"default_value\":\"16\"},
  \"meta\":{\"interface\":\"select-dropdown\",\"options\":{\"choices\":$SIZE_CHOICES,\"allowOther\":false},
  \"note\":\"Rozmiar czcionki strony w px (domyślnie: 16px).\",\"width\":\"half\",
  \"translations\":[{\"language\":\"pl-PL\",\"translation\":\"Rozmiar czcionki (px)\"}]}}"

add_field "page_style" "nav_font" "{
  \"field\":\"nav_font\",\"type\":\"string\",\"schema\":{\"is_nullable\":true},
  \"meta\":{\"interface\":\"select-dropdown\",\"options\":{\"choices\":$FONT_CHOICES,\"allowOther\":true},
  \"note\":\"Czcionka nawigacji. Puste = taka sama jak czcionka strony.\",\"width\":\"half\",
  \"translations\":[{\"language\":\"pl-PL\",\"translation\":\"Czcionka nawigacji\"}]}}"

add_field "page_style" "nav_font_size" "{
  \"field\":\"nav_font_size\",\"type\":\"string\",\"schema\":{\"is_nullable\":true,\"default_value\":\"14\"},
  \"meta\":{\"interface\":\"select-dropdown\",\"options\":{\"choices\":$NAV_SIZE_CHOICES,\"allowOther\":false},
  \"note\":\"Rozmiar czcionki nawigacji w px (domyślnie: 14px).\",\"width\":\"half\",
  \"translations\":[{\"language\":\"pl-PL\",\"translation\":\"Rozmiar czcionki nawigacji (px)\"}]}}"

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
    "heading_font": "Amatic SC",
    "base_font_size": "16",
    "nav_font_size": "14"
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
echo "  2. Go to Directus admin → Styl strony to set colours and fonts"
