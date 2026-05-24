#!/bin/bash
# ── Patch Polish field labels on existing Directus instance ───────────────────
# Usage:
#   DIRECTUS_URL=https://ja-pacze-sercem-cms.onrender.com \
#   DIRECTUS_EMAIL=you@email.com \
#   DIRECTUS_PASSWORD=yourpass \
#   bash directus/patch-labels.sh

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

TOKEN=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DIRECTUS_EMAIL\",\"password\":\"$DIRECTUS_PASSWORD\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Auth failed"
  exit 1
fi
echo "✅ Authenticated to $DIRECTUS_URL"

# Set admin language to Polish
ME=$(curl -s "$DIRECTUS_URL/users/me" -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
if [ -n "$ME" ]; then
  curl -s -X PATCH "$DIRECTUS_URL/users/$ME" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"language":"pl-PL"}' > /dev/null
  echo "✅ Admin language set to Polish"
fi
echo ""

pf() {
  RESULT=$(curl -s -X PATCH "$DIRECTUS_URL/fields/$1/$2" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"meta\":{\"translations\":[{\"language\":\"pl-PL\",\"translation\":\"$3\"}]}}")
  OK=$(echo $RESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print('✓' if 'data' in d else '✗')" 2>/dev/null)
  echo "   $OK $1.$2 → $3"
}

echo "=== cats ==="
pf cats name "Imie"
pf cats slug "URL (slug)"
pf cats status "Status"
pf cats category "Kategoria wiekowa"
pf cats gender "Plec"
pf cats date_of_birth "Data urodzenia"
pf cats description "Opis"
pf cats story "Historia"
pf cats photos "Zdjecia"
pf cats traits "Cechy szczegolne"

echo "=== cat_traits ==="
pf cat_traits label "Nazwa cechy"
pf cat_traits icon "Ikona (emoji)"

echo "=== news ==="
pf news title "Tytul"
pf news slug "URL (slug)"
pf news published_at "Data publikacji"
pf news body "Tresc"
pf news excerpt "Zajawka"
pf news cover_image "Zdjecie glowne"

echo "=== pages ==="
pf pages slug "Identyfikator strony"
pf pages title "Tytul"
pf pages content "Tresc"

echo "=== documents ==="
pf documents name "Nazwa dokumentu"
pf documents file "Plik"
pf documents category "Kategoria"

echo "=== menu_items ==="
pf menu_items label "Etykieta"
pf menu_items url "Adres URL"
pf menu_items order "Kolejnosc"
pf menu_items open_in_new_tab "Otworz w nowej karcie"

echo "=== social_links ==="
pf social_links platform "Platforma"
pf social_links url "Adres URL"
pf social_links icon "Ikona"

echo "=== site_settings ==="
pf site_settings site_name "Nazwa strony"
pf site_settings tagline "Slogan"
pf site_settings banner_enabled "Banner wlaczony"
pf site_settings banner_text "Tekst bannera"
pf site_settings banner_color "Kolor bannera"
pf site_settings founded_year "Rok zalozenia"
pf site_settings cats_adopted_before_website "Koty adoptowane przed strona"
pf site_settings contact_form_enabled "Formularz kontaktowy wlaczony"
pf site_settings contact_email "E-mail kontaktowy"
pf site_settings contact_email_visible "Pokaz e-mail publicznie"

echo "=== adoption_questions ==="
pf adoption_questions question "Pytanie"
pf adoption_questions field_type "Typ pola"
pf adoption_questions options "Opcje (JSON)"
pf adoption_questions required "Wymagane"
pf adoption_questions active "Aktywne"
pf adoption_questions order "Kolejnosc"
pf adoption_questions placeholder "Placeholder"

# ── Collection name translations (Data Model display names) ──────────────────
echo "=== partners ==="
pf partners name "Nazwa"
pf partners url "Strona WWW"
pf partners logo "Logo"
pf partners description "Opis"
pf partners order "Kolejnosc"
pf partners active "Aktywny"

echo "=== support_methods ==="
pf support_methods title "Tytul"
pf support_methods type "Typ"
pf support_methods description "Opis"
pf support_methods url "Link"
pf support_methods button_label "Tekst przycisku"
pf support_methods icon "Ikona (emoji)"
pf support_methods order "Kolejnosc"
pf support_methods active "Aktywny"

echo ""
echo "=== Collection translations ==="

pc() {
  COLLECTION=$1; SINGULAR=$2; PLURAL=$3
  RESULT=$(curl -s -X PATCH "$DIRECTUS_URL/collections/$COLLECTION" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"meta\":{\"translations\":[{\"language\":\"pl-PL\",\"translation\":\"$PLURAL\",\"singular\":\"$SINGULAR\",\"plural\":\"$PLURAL\"}]}}")
  echo "   $(echo $RESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print('✓' if 'data' in d else '✗')" 2>/dev/null) $COLLECTION → $SINGULAR / $PLURAL"
}

pc "cats"               "Kot"               "Koty"
pc "cat_traits"         "Cecha kota"        "Cechy kotow"
pc "news"               "Aktualnosc"        "Aktualnosci"
pc "pages"              "Strona"            "Strony"
pc "documents"          "Dokument"          "Dokumenty"
pc "menu_items"         "Element menu"      "Menu"
pc "social_links"       "Link social media" "Social media"
pc "site_settings"      "Ustawienia"        "Ustawienia strony"
pc "adoption_questions" "Pytanie"           "Pytania adopcyjne"
pc "partners"           "Partner"           "Partnerzy"
pc "support_methods"    "Sposob wsparcia"   "Sposoby wsparcia"

echo ""
echo "✅ Done!"
