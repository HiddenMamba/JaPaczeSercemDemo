#!/bin/bash
# ── Directus Seed Script ──────────────────────────────────────────────────────
# Seeds the local Directus instance with default Polish content.
# Run after: docker compose -f docker-compose.dev.yml up -d
#
# Usage:
#   chmod +x directus/seed.sh
#   ./directus/seed.sh
#
# Or against Render:
#   DIRECTUS_URL=https://ja-pacze-sercem-cms.onrender.com \
#   DIRECTUS_EMAIL=you@email.com DIRECTUS_PASSWORD=yourpass \
#   ./directus/seed.sh

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

echo "Connecting to $DIRECTUS_URL..."

TOKEN=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DIRECTUS_EMAIL\",\"password\":\"$DIRECTUS_PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

if [ -z "$TOKEN" ]; then
  echo "ERROR: Could not get token. Is Directus running?"
  exit 1
fi
echo "Authenticated OK"

AUTH="-H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\""

req() {
  METHOD=$1; URL=$2; DATA=$3
  curl -s -X "$METHOD" "$DIRECTUS_URL$URL" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    ${DATA:+-d "$DATA"} | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'data' in d else 'ERR: '+str(d))"
}

# ── Cat Traits ────────────────────────────────────────────────────────────────
echo ""
echo "=== Cat Traits ==="
req POST /items/cat_traits '{"icon":"🦠","label":"FIV+"}'
req POST /items/cat_traits '{"icon":"🫣","label":"Niesmia\u0142y"}'
req POST /items/cat_traits '{"icon":"👁️","label":"Jednooki"}'
req POST /items/cat_traits '{"icon":"🍽️","label":"Potrzebuje diety"}'
req POST /items/cat_traits '{"icon":"💊","label":"Leczenie przewlek\u0142e"}'
req POST /items/cat_traits '{"icon":"🏠","label":"Tylko dom"}'

# ── Menu Items ────────────────────────────────────────────────────────────────
echo ""
echo "=== Menu Items ==="
req POST /items/menu_items '{"label":"Strona g\u0142\u00f3wna","url":"/","order":1}'
req POST /items/menu_items '{"label":"Adoptuj kota","url":"/koty","order":2}'
req POST /items/menu_items '{"label":"Aktualno\u015bci","url":"/aktualnosci","order":3}'
req POST /items/menu_items '{"label":"O nas","url":"/o-nas","order":4}'
req POST /items/menu_items '{"label":"Kontakt","url":"/kontakt","order":5}'
req POST /items/menu_items '{"label":"Wesprzyj nas","url":"/wesprzyj-nas","order":6}'

# ── Pages ─────────────────────────────────────────────────────────────────────
echo ""
echo "=== Pages ==="
req POST /items/pages '{"slug":"about","title":"O nas","content":"<h2>Kim jeste\u015bmy?</h2><p>Jeste\u015bmy fundacj\u0105 adopcyjn\u0105 pomagaj\u0105c\u0105 kotom znale\u017a\u0107 domy pe\u0142ne mi\u0142o\u015bci.</p>"}'
req POST /items/pages '{"slug":"contact","title":"Kontakt","content":"<p>Napisz do nas! Odpiszemy najszybciej jak mo\u017cemy.</p>"}'
req POST /items/pages '{"slug":"partners","title":"Partnerzy","content":"<p>Dzi\u0119kujemy naszym partnerom za wsparcie.</p>"}'

# ── Social Links ──────────────────────────────────────────────────────────────
echo ""
echo "=== Social Links ==="
req POST /items/social_links '{"platform":"facebook","url":"https://facebook.com","icon":"facebook"}'
req POST /items/social_links '{"platform":"instagram","url":"https://instagram.com","icon":"instagram"}'

# ── Demo Cats ─────────────────────────────────────────────────────────────────
echo ""
echo "=== Demo Cats ==="
req POST /items/cats '{"slug":"luna","name":"Luna","status":"available","gender":"female","category":"adult","date_of_birth":"2021-03-15","description":"Luna to spokojna i lagodna kotka szukajaca cichego domu. Uwielbia lezec na slonecznym parapecie i obserwowac ptaki.","story":"Luna trafila do nas po tym, jak jej wlasciciel musial wyjechac za granice. Jest oswojona i bardzo przywiazana do ludzi."}'
req POST /items/cats '{"slug":"oliver","name":"Oliver","status":"available","gender":"male","category":"adult","date_of_birth":"2020-06-01","description":"Oliver to energiczny kocur z duza osobowoscia. Kocha zabawki z piorkami i wieczorne drapanie za uszami.","story":"Znaleziony jako bezdomny w centrum miasta. Po kilku miesiacach opieki jest gotowy na nowy dom."}'
req POST /items/cats '{"slug":"mruczek","name":"Mruczek","status":"available","gender":"male","category":"kitten","date_of_birth":"2025-01-10","description":"Malutki Mruczek szuka rodziny, ktora da mu duzo milosci. Bardzo playful i ciekawski.","story":null}'
req POST /items/cats '{"slug":"zuzia","name":"Zuzia","status":"reserved","gender":"female","category":"senior","date_of_birth":"2015-09-20","description":"Zuzia to doswiadczona kotka, ktora zna cene spokoju. Idealna dla osob ceniascych ciche towarzystwo.","story":"Zuzia spedzila 8 lat z jedna rodzina, ktora niestety musiala sie przeprowadzic do mieszkania bez mozliwosci trzymania zwierzat."}'
req POST /items/cats '{"slug":"tygrys","name":"Tygrys","status":"available","gender":"male","category":"adult","date_of_birth":"2022-11-05","description":"Tygrys ma piekne prazki i charakter pelen energii. Swietnie dogaduje sie z innymi kotami.","story":null}'

# ── Site Settings ─────────────────────────────────────────────────────────────
echo ""
echo "=== Site Settings ==="
req POST /items/site_settings '{"site_name":"Ja Pacze Sercem","tagline":"Daj kotu dom na zawsze","banner_enabled":false,"banner_color":"orange","founded_year":2020,"cats_adopted_before_website":47}'

echo ""
echo "✅ Seed complete!"
