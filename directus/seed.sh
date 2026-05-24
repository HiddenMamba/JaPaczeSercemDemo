#!/bin/bash
# ── Directus Seed Script ──────────────────────────────────────────────────────
# Seeds a fresh Directus instance with default Polish content.
# Run AFTER applying the schema snapshot.
#
# Local usage:
#   chmod +x directus/seed.sh
#   ./directus/seed.sh
#
# Against Render:
#   DIRECTUS_URL=https://ja-pacze-sercem-cms.onrender.com \
#   DIRECTUS_EMAIL=you@email.com \
#   DIRECTUS_PASSWORD=yourpass \
#   ./directus/seed.sh

set -e

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
DIRECTUS_EMAIL=${DIRECTUS_EMAIL:-admin@example.com}
DIRECTUS_PASSWORD=${DIRECTUS_PASSWORD:-admin123}

echo ""
echo "🐱 Ja Pacze Sercem — Directus Seed Script"
echo "   Target: $DIRECTUS_URL"
echo ""

# ── Auth ──────────────────────────────────────────────────────────────────────
TOKEN=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DIRECTUS_EMAIL\",\"password\":\"$DIRECTUS_PASSWORD\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Could not authenticate. Is Directus running at $DIRECTUS_URL?"
  exit 1
fi
echo "✅ Authenticated"

# Helper: POST to collection, print OK or error
post() {
  COLLECTION=$1
  DATA=$2
  RESULT=$(curl -s -X POST "$DIRECTUS_URL/items/$COLLECTION" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$DATA")
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    echo "   ✓ $COLLECTION"
  else
    echo "   ✗ $COLLECTION: $(echo $RESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','unknown'))" 2>/dev/null)"
  fi
}

# Helper: PATCH singleton (upsert — tries PATCH first, falls back to POST)
patch_singleton() {
  COLLECTION=$1
  DATA=$2
  # Try PATCH (singleton already exists)
  RESULT=$(curl -s -X PATCH "$DIRECTUS_URL/items/$COLLECTION" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$DATA")
  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
    echo "   ✓ $COLLECTION (updated)"
  else
    # Fall back to POST (first time)
    RESULT=$(curl -s -X POST "$DIRECTUS_URL/items/$COLLECTION" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$DATA")
    if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'data' in d else 1)" 2>/dev/null; then
      echo "   ✓ $COLLECTION (created)"
    else
      echo "   ✗ $COLLECTION: $(echo $RESULT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','unknown'))" 2>/dev/null)"
    fi
  fi
}

# ── Site Settings ─────────────────────────────────────────────────────────────
echo ""
echo "=== Site Settings ==="
patch_singleton site_settings '{
  "site_name": "Ja Pacze Sercem",
  "tagline": "Daj kotu dom na zawsze",
  "banner_enabled": true,
  "banner_text": "Adoptuj kota i daj mu dom na zawsze! Skontaktuj sie z nami juz dzis.",
  "banner_color": "orange",
  "founded_year": 2020,
  "cats_adopted_before_website": 47,
  "contact_form_enabled": true,
  "contact_email_visible": false,
  "contact_email": "kontakt@japacze.pl"
}'

# ── Cat Traits ────────────────────────────────────────────────────────────────
echo ""
echo "=== Cat Traits ==="
post cat_traits '{"icon":"🦠","label":"FIV+"}'
post cat_traits '{"icon":"🫣","label":"Niesmia\u0142y"}'
post cat_traits '{"icon":"👁️","label":"Jednooki"}'
post cat_traits '{"icon":"🍽️","label":"Potrzebuje diety"}'
post cat_traits '{"icon":"💊","label":"Leczenie przewlekle"}'
post cat_traits '{"icon":"🏠","label":"Tylko dom"}'
post cat_traits '{"icon":"🐾","label":"Przyjazny psom"}'
post cat_traits '{"icon":"👶","label":"Przyjazny dzieciom"}'

# ── Social Links ──────────────────────────────────────────────────────────────
echo ""
echo "=== Social Links ==="
post social_links '{"platform":"facebook","url":"https://facebook.com","icon":"facebook"}'
post social_links '{"platform":"instagram","url":"https://instagram.com","icon":"instagram"}'

# ── Menu Items ────────────────────────────────────────────────────────────────
echo ""
echo "=== Menu Items ==="
post menu_items '{"label":"Strona g\u0142\u00f3wna","url":"/","order":1,"open_in_new_tab":false}'
post menu_items '{"label":"Adoptuj kota","url":"/koty","order":2,"open_in_new_tab":false}'
post menu_items '{"label":"Aktualno\u015bci","url":"/aktualnosci","order":3,"open_in_new_tab":false}'
post menu_items '{"label":"O nas","url":"/o-nas","order":4,"open_in_new_tab":false}'
post menu_items '{"label":"Kontakt","url":"/kontakt","order":5,"open_in_new_tab":false}'
post menu_items '{"label":"Wesprzyj nas","url":"/wesprzyj-nas","order":6,"open_in_new_tab":false}'

# ── Pages ─────────────────────────────────────────────────────────────────────
echo ""
echo "=== Pages ==="
post pages '{
  "slug": "about",
  "title": "O nas",
  "content": "<h2>Kim jestesmy?</h2><p>Jestesmy fundacja adopcyjna pomagajaca kotom znalezc domy pelne milosci. Od 2020 roku pomoglismy ponad 47 kotom znalezc nowe, kochajace rodziny.</p><h2>Nasza misja</h2><p>Wierzymy, ze kazdy kot zasługuje na bezpieczny dom, cieplo i milosc. Pracujemy z lokalnymi schroniskami i wolontariuszami, aby zapewnic kotom najlepsza opieke przed adopcja.</p>"
}'
post pages '{
  "slug": "contact",
  "title": "Kontakt",
  "content": "<p>Masz pytanie dotyczace adopcji lub chcesz zostac wolontariuszem? Napisz do nas!</p><p>Odpowiadamy na wiadomosci w ciagu 24-48 godzin.</p>"
}'
post pages '{
  "slug": "partners",
  "title": "Partnerzy",
  "content": "<p>Dziekujemy naszym partnerom i sponsorom za nieocenione wsparcie. Razem mozemy pomoc wiekszej liczbie kotow znalezc domy.</p>"
}'

# ── Sample News ───────────────────────────────────────────────────────────────
echo ""
echo "=== News ==="
post news '{
  "slug": "witamy-na-stronie",
  "title": "Witamy na nowej stronie Ja Pacze Sercem!",
  "published_at": "2024-01-15T10:00:00Z",
  "body": "<p>Z radoscia ogłaszamy uruchomienie nowej strony internetowej fundacji Ja Pacze Sercem. Teraz mozesz latwo przegladac nasze koty, skladac wnioski adopcyjne i sledzic nasze aktualnosci.</p><p>Nasz nowy portal ułatwia nam dotarcie do jeszcze wiekszej liczby kochajacych rodzin, ktore chca dac kotu dom na zawsze.</p>",
  "excerpt": "Uruchomilismy nowa strone internetowa! Teraz mozesz latwo przegladac nasze koty i skladac wnioski adopcyjne online."
}'
post news '{
  "slug": "jak-przygotowac-dom-na-przyjecie-kota",
  "title": "Jak przygotowac dom na przyjecie kota?",
  "published_at": "2024-02-01T10:00:00Z",
  "body": "<h2>Pierwsze kroki</h2><p>Zanim kot trafi do Twojego domu, warto sie odpowiednio przygotowac. Oto kilka wskazowek, ktore pomoga w plynnym przejsciu.</p><h3>1. Przygotuj bezpieczna przestrzen</h3><p>Wyznacz osobny pokoj lub kacik, gdzie kot bedzie mogl sie najpierw zaaklimatyzowac. Powinien zawierac: miske z woda, jedzenie, kuwete i legowisko.</p><h3>2. Zabezpiecz mieszkanie</h3><p>Sprawdz, czy okna i balkony sa odpowiednio zabezpieczone. Schowaj kable elektryczne i wszelkie male przedmioty, ktore kot moze polknac.</p><h3>3. Pierwsze dni</h3><p>Nie spiesz sie z kontaktem. Pozwol kotu samemu wychodzic ze swojego kacika i poznawac otoczenie we wlasnym tempie.</p>",
  "excerpt": "Adopcja kota to wielka radosc, ale tez odpowiedzialnosc. Dowiedz sie, jak dobrze przygotowac dom na przyjecie nowego czlonka rodziny."
}'
post news '{
  "slug": "historia-sukcesu-luna",
  "title": "Historia sukcesu: Luna znalazla dom!",
  "published_at": "2024-03-10T10:00:00Z",
  "body": "<p>Z wielka radoscia informujemy, ze Luna — nasza lagodna szara kotka — znalazla wymarzony dom! Nowa rodzina zakochala sie w niej od pierwszego wejrzenia.</p><p>Luna spedzila z nami 3 miesiace. Byla nieśmiala i potrzebowala czasu, zeby zaufac ludziom. Dzieki cierpliwosci i milosci wolontariuszy stala sie towarzyska i kochajaca kotka.</p><p>Dziekujemy rodzinie Kowalskich za otwarcie serca i domu dla Luny! To wlasnie takie chwile przypominaja nam, dlaczego robimy to co robimy.</p>",
  "excerpt": "Luna, nasza lagodna szara kotka, znalazla wymarzony dom. Poznaj jej wzruszajaca historie."
}'

# ── Demo Cats ─────────────────────────────────────────────────────────────────
echo ""
echo "=== Demo Cats ==="
post cats '{
  "slug": "luna",
  "name": "Luna",
  "status": "available",
  "gender": "female",
  "category": "adult",
  "date_of_birth": "2021-03-15",
  "description": "Luna to spokojna i lagodna kotka szukajaca cichego domu. Uwielbia lezec na slonecznym parapecie i obserwowac ptaki za oknem.",
  "story": "Luna trafila do nas po tym, jak jej wlasciciel musial wyjechac za granice. Jest dobrze oswojona i bardzo przywiazana do ludzi."
}'
post cats '{
  "slug": "oliver",
  "name": "Oliver",
  "status": "available",
  "gender": "male",
  "category": "adult",
  "date_of_birth": "2020-06-01",
  "description": "Oliver to energiczny kocur z duza osobowoscia. Kocha zabawki z piorkami i wieczorne drapanie za uszami.",
  "story": "Znaleziony jako bezdomny w centrum miasta. Po kilku miesiacach opieki jest gotowy na nowy dom."
}'
post cats '{
  "slug": "mruczek",
  "name": "Mruczek",
  "status": "available",
  "gender": "male",
  "category": "kitten",
  "date_of_birth": "2025-01-10",
  "description": "Malutki Mruczek szuka rodziny, ktora da mu duzo milosci. Jest bardzo ciekawski i uwielbia zabawke.",
  "story": null
}'
post cats '{
  "slug": "zuzia",
  "name": "Zuzia",
  "status": "reserved",
  "gender": "female",
  "category": "senior",
  "date_of_birth": "2015-09-20",
  "description": "Zuzia to doswiadczona kotka, ktora zna cene spokoju. Idealna dla osob ceniascych ciche towarzystwo.",
  "story": "Zuzia spedzila 8 lat z jedna rodzina, ktora niestety musiala sie przeprowadzic do mieszkania bez mozliwosci trzymania zwierzat."
}'
post cats '{
  "slug": "tygrys",
  "name": "Tygrys",
  "status": "available",
  "gender": "male",
  "category": "adult",
  "date_of_birth": "2022-11-05",
  "description": "Tygrys ma piekne prazki i charakter pelny energii. Swietnie dogaduje sie z innymi kotami.",
  "story": null
}'
post cats '{
  "slug": "czesia",
  "name": "Czesia",
  "status": "available",
  "gender": "female",
  "category": "kitten",
  "date_of_birth": "2025-02-20",
  "description": "Czesia to mala odkrywczyni — bada kazdy kat mieszkania z niesamowitym entuzjazmem. Szuka aktywnej rodziny.",
  "story": null
}'

echo ""
echo "✅ Seed complete! $(date)"
echo ""
echo "Next steps:"
echo "  1. Go to $DIRECTUS_URL/admin"
echo "  2. Add photos to cats in the Cats collection"
echo "  3. Update social media URLs in Social Links"
echo "  4. Add your real contact info and pages content"
echo ""
