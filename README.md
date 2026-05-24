# 🐱 Ja Paczę Sercem — Strona Adopcyjna

Strona internetowa fundacji adopcyjnej zbudowana na **Next.js 15** + **Directus CMS** + **PostgreSQL**.

- Zarządzanie treścią bez kodu — przez panel admina Directus
- Przeglądarka kotów z filtrami (status, wiek, płeć, cechy)
- Formularz adopcyjny generujący gotową wiadomość
- Aktualności, partnerzy, sposoby wsparcia
- Automatyczny HTTPS przez Caddy (produkcja) lub Vercel (demo)

---

## 🗂️ Struktura projektu

```
cat-adoption/
├── frontend/              # Next.js 15 (App Router)
│   ├── app/               # Strony (koty, aktualnosci, kontakt, ...)
│   ├── components/        # Komponenty UI
│   ├── lib/               # directus.ts, types.ts
│   └── .env.example       # Przykład zmiennych środowiskowych
├── directus/
│   ├── schema-snapshot.json   # Schemat bazy danych (wersjonowany)
│   ├── seed.sh                # Skrypt seedowania danych
│   ├── patch-labels.sh        # Skrypt polskich etykiet pól
│   └── run-render.sh          # Interaktywny runner dla Render
├── docker-compose.yml         # Produkcja (VPS)
├── docker-compose.dev.yml     # Development lokalny
├── Caddyfile                  # Reverse proxy + HTTPS
└── .env.prod.example          # Przykład zmiennych produkcyjnych
```

---

## 🚀 CZĘŚĆ 1 — Setup od zera (Demo online, BEZPŁATNE)

### Wymagania
- Konto GitHub
- Konto Render (render.com)
- Konto Vercel (vercel.com)

---

### Krok 1 — Render: PostgreSQL

1. Render → **New → PostgreSQL**
2. Nazwa: `cat-adoption-db`, Plan: **Free**
3. Skopiuj **Internal Database URL** — potrzebny w kroku 2

---

### Krok 2 — Render: Directus CMS

1. Render → **New → Web Service**
2. Docker image: `directus/directus:11`
3. Plan: **Free**
4. Zmienne środowiskowe:

| Zmienna | Wartość |
|---|---|
| `DB_CLIENT` | `pg` |
| `DB_HOST` | hostname z Internal Database URL |
| `DB_PORT` | `5432` |
| `DB_DATABASE` | nazwa bazy |
| `DB_USER` | użytkownik bazy |
| `DB_PASSWORD` | hasło bazy |
| `SECRET` | dowolny długi losowy ciąg |
| `ADMIN_EMAIL` | twój email admina |
| `ADMIN_PASSWORD` | silne hasło |
| `PUBLIC_URL` | `https://twoj-render-url.onrender.com` |
| `STORAGE_LOCATIONS` | `local` |
| `STORAGE_LOCAL_ROOT` | `/directus/uploads` |
| `CORS_ENABLED` | `true` |
| `CORS_ORIGIN` | `https://twoja-domena.vercel.app` |

---

### Krok 3 — Import schematu bazy danych

Po uruchomieniu Directus, zaaplikuj schemat przez API:

```bash
# Pobierz token admina
TOKEN=$(curl -s -X POST https://twoj-cms.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "password": "haslo"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

# Diff schematu
curl -s -X POST "https://twoj-cms.onrender.com/schema/diff?force=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @directus/schema-snapshot.json > /tmp/diff.json

# Sprawdź hash
python3 -c "import json; d=json.load(open('/tmp/diff.json')); open('/tmp/apply.json','w').write(json.dumps(d['data'])); print('Hash:', d['data']['hash'])"

# Zastosuj schemat
curl -X POST "https://twoj-cms.onrender.com/schema/apply?force=true" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/apply.json
```

---

### Krok 4 — Seedowanie danych

```bash
# Uruchom interaktywny runner
bash directus/run-render.sh
# Wpisz URL, email i hasło Directus
# Wybierz: 1 (seed) — wypełni bazę przykładowymi danymi
```

Seed tworzy:
- 🐱 6 przykładowych kotów
- 📰 3 artykuły
- 📄 3 strony (O nas, Kontakt, Partnerzy)
- 🧭 7 pozycji menu
- ❤️ 4 sposoby wsparcia
- 🤝 Social linki
- ❓ 8 pytań formularza adopcyjnego
- ⚙️ Ustawienia strony z banerem

---

### Krok 5 — Polskie etykiety pól w Directus

```bash
bash directus/run-render.sh
# Wybierz: 2 (patch-labels)
```

---

### Krok 6 — Uprawnienia publiczne w Directus

W panelu admina Directus:
1. **Settings → Access Policies → Public**
2. Ustaw **Read** na **All** dla:
   - `cats`, `cat_traits`, `cats_traits`, `cats_files`
   - `news`, `pages`, `documents`
   - `menu_items`, `social_links`
   - `partners`, `support_methods`
   - `adoption_questions`, `site_settings`
   - `directus_files`

---

### Krok 7 — Vercel (frontend)

1. Vercel → **Add New → Project** → importuj repo z GitHub
2. Framework: **Next.js**
3. Root Directory: `frontend`
4. Zmienne środowiskowe:

| Zmienna | Wartość |
|---|---|
| `DIRECTUS_URL` | `https://twoj-cms.onrender.com` |
| `DIRECTUS_TOKEN` | statyczny token z Directus → Users → Admin → Token |
| `DIRECTUS_HOST` | `twoj-cms.onrender.com` |
| `NEXT_PUBLIC_DIRECTUS_URL` | `https://twoj-cms.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://twoja-domena.vercel.app` |
| `NEXT_PUBLIC_SITE_NAME` | `Ja Paczę Sercem` |
| `RESEND_API_KEY` | klucz z resend.com (opcjonalny — do formularza kontaktowego) |
| `CONTACT_EMAIL` | email do odbierania wiadomości |

5. **Deploy** — strona będzie dostępna pod adresem Vercel

---

### Krok 8 — UptimeRobot (zapobieganie uśpieniu Render)

Render usypia bezpłatne usługi po 15 min braku ruchu.

1. uptimerobot.com → **Add New Monitor**
2. Type: **HTTP(s)**
3. URL: `https://twoj-cms.onrender.com/server/health`
4. Interval: **5 minut**

---

## 🖥️ CZĘŚĆ 2 — Serwer produkcyjny (VPS)

### Wymagania
- Serwer Ubuntu 22.04+ z min. 2GB RAM
- Domena z dostępem do DNS

### Krok 1 — Przygotowanie serwera

```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin git
```

### Krok 2 — Konfiguracja środowiska

```bash
git clone https://github.com/HiddenMamba/JaPaczeSercemDemo.git
cd cat-adoption
cp .env.prod.example .env
nano .env  # Wypełnij wszystkie zmienne
```

### Krok 3 — DNS

Ustaw rekord A dla domeny na IP serwera. Caddy automatycznie pobierze certyfikat SSL.

### Krok 4 — Uruchomienie

```bash
docker compose up -d
```

### Krok 5 — Import schematu i seedowanie

```bash
# Poczekaj ~60s na uruchomienie Directus, potem:
TOKEN=$(curl -s -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "password": "haslo"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

curl -s -X POST "http://localhost:8055/schema/diff" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @directus/schema-snapshot.json > /tmp/diff.json

python3 -c "import json; d=json.load(open('/tmp/diff.json')); open('/tmp/apply.json','w').write(json.dumps(d['data']))"

curl -X POST "http://localhost:8055/schema/apply" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/apply.json

bash directus/seed.sh
```

---

## 🛠️ Lokalny development

```bash
# 1. Uruchom Postgres + Directus w Docker
docker compose -f docker-compose.dev.yml up -d postgres directus

# 2. Skonfiguruj frontend
cp frontend/.env.example frontend/.env.local
# Edytuj frontend/.env.local — dodaj DIRECTUS_TOKEN z panelu admina

# 3. Uruchom frontend
cd frontend && npm install && npm run dev
```

Frontend dostępny na http://localhost:3000
Directus admin na http://localhost:8055/admin

### Seedowanie lokalnej bazy

```bash
# Zastosuj schemat
TOKEN=$(curl -s -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

curl -s -X POST "http://localhost:8055/schema/diff" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @directus/schema-snapshot.json > /tmp/diff.json

python3 -c "import json; d=json.load(open('/tmp/diff.json')); open('/tmp/apply.json','w').write(json.dumps(d['data']))"

curl -X POST "http://localhost:8055/schema/apply" \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/apply.json

bash directus/seed.sh
```

---

## 📱 Zarządzanie treścią (panel admina)

### Dodawanie kota
1. **Koty** → **+ Utwórz**
2. Wypełnij: Imię, URL (slug), Status, Płeć, Data urodzenia
3. Dodaj zdjęcia (pierwsze = główne)
4. Wybierz cechy szczególne
5. Zapisz

> Kategoria wiekowa (Kocię/Dorosły/Senior) jest obliczana automatycznie z daty urodzenia.

### Zarządzanie banerem
1. **Ustawienia strony** → `banner_enabled = true`
2. Wpisz `banner_text` — pojawi się na górze strony

### Formularz adopcyjny
1. **Pytania adopcyjne** → dodaj/edytuj/ukryj pytania
2. Typy: Tekst, Długi tekst, Jednokrotny wybór (radio), Wielokrotny wybór
3. Dla radio/multiselect dodaj opcje w formacie JSON: `[{"label":"Opcja","value":"wartosc"}]`

### Wesprzyj nas
1. **Sposoby wsparcia** → **+ Utwórz**
2. Typy: Informacja, Numer konta, Link zewnętrzny, Zrzutka/Patronite
3. Ustaw ikonę emoji, opis (rich text), opcjonalny przycisk z linkiem

### Partnerzy
1. **Partnerzy** → **+ Utwórz**
2. Dodaj logo (obraz), nazwę, opis, link do strony
3. Ustaw kolejność wyświetlania

---

## 🔧 Skrypty pomocnicze

| Skrypt | Opis |
|---|---|
| `bash directus/run-render.sh` | Interaktywny runner (seed lub patch-labels) |
| `bash directus/seed.sh` | Seedowanie danych (lokalnie) |
| `bash directus/patch-labels.sh` | Polskie etykiety pól w Directus |

---

## 💰 Koszty (wersja demo)

| Usługa | Plan | Koszt |
|---|---|---|
| Render (Directus) | Free | 0 zł |
| Render (PostgreSQL) | Free | 0 zł |
| Vercel (Next.js) | Hobby | 0 zł |
| UptimeRobot | Free | 0 zł |
| **Razem** | | **0 zł/mies.** |

---

## 🔒 Checklista przed wdrożeniem

- [ ] Zmień domyślne hasło admina Directus
- [ ] Ustaw silny `SECRET` w zmiennych Render
- [ ] Skonfiguruj uprawnienia publiczne w Directus
- [ ] Dodaj `DIRECTUS_TOKEN` do zmiennych Vercel
- [ ] Skonfiguruj UptimeRobot dla Render
- [ ] Zaktualizuj `CORS_ORIGIN` na rzeczywistą domenę frontend
