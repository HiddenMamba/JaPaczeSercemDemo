# 🐱 Ja Paczę Sercem — Strona Adopcyjna

Strona internetowa fundacji adopcyjnej zbudowana na **Next.js 15** + **Directus CMS** + **PostgreSQL**.

- Zarządzanie treścią bez kodu — przez panel admina Directus
- Dwujęzyczna (🇵🇱 Polski domyślnie, 🇬🇧 angielski pod `/en`)
- Przeglądarka kotów z filtrami, randomizatorem i slideout panelem
- Formularz adopcyjny z pytaniami konfigurowanymi w panelu
- Zarządzanie menu, partnerami, dokumentami PDF, social media
- Baner strony i logo zarządzane z panelu

---

## 🗂️ Struktura projektu

```
cat-adoption/
├── frontend/                    # Next.js 15 (App Router)
│   ├── app/[locale]/            # Strony PL/EN
│   │   ├── page.tsx             # Strona główna
│   │   ├── cats/                # Przeglądarka kotów + szczegóły
│   │   ├── news/                # Aktualności
│   │   ├── about/               # O nas + dokumenty
│   │   ├── contact/             # Formularz kontaktowy
│   │   ├── partners/            # Partnerzy
│   │   ├── wesprzyj-nas/        # Wesprzyj nas (Patronite, przelew)
│   │   └── adoptuj/             # Formularz adopcyjny
│   ├── components/              # Komponenty React
│   ├── lib/directus.ts          # Klient Directus SDK + helpers
│   └── messages/                # pl.json, en.json
├── directus/
│   └── schema-snapshot.json     # Schemat bazy danych
├── docker-compose.yml           # Produkcja (wszystkie usługi)
├── docker-compose.dev.yml       # Lokalny dev (Directus + Postgres)
└── Caddyfile                    # Reverse proxy + auto HTTPS
```

---

## 🚀 CZĘŚĆ 1

### Wymagania
- Konto GitHub
- Konto Vercel (free) — https://vercel.com
- Konto Render (free) — https://render.com
- Konto Neon (free PostgreSQL) — https://neon.tech
- Opcjonalnie: konto Resend (email) — https://resend.com

---

### Krok 1 — Neon (baza danych PostgreSQL)

1. Przejdź na https://neon.tech → **Create project**
2. Nazwa projektu: `ja-paczę-sercem`
3. Region: Frankfurt (EU) lub najbliższy
4. Po utworzeniu skopiuj **Connection string** (format: `postgresql://user:pass@host/db?sslmode=require`)
5. Zapisz — będzie potrzebny w Kroku 2

---

### Krok 2 — Render (Directus CMS)

1. Przejdź na https://render.com → **New → Web Service**
2. Wybierz **Deploy an existing image from a registry**
3. Image URL: `directus/directus:11`
4. Nazwa: `ja-paczę-sercem-cms`
5. Region: Frankfurt
6. Instance type: **Free**
7. Dodaj zmienne środowiskowe (**Environment → Add Environment Variable**):

| Klucz | Wartość |
|---|---|
| `SECRET` | wygeneruj losowy ciąg 64 znaków (np. z https://randomkeygen.com) |
| `DB_CLIENT` | `pg` |
| `DB_CONNECTION_STRING` | connection string z Neon (Krok 1) |
| `ADMIN_EMAIL` | twój email |
| `ADMIN_PASSWORD` | silne hasło (min. 12 znaków) |
| `PUBLIC_URL` | zostaw puste na razie — uzupełnisz po deploymencie |
| `CORS_ENABLED` | `true` |
| `CORS_ORIGIN` | zostaw puste na razie — uzupełnisz po deploymencie Vercel |
| `STORAGE_LOCATIONS` | `local` |

8. Kliknij **Create Web Service** — poczekaj ~3 minuty
9. Skopiuj URL wdrożenia (np. `https://ja-paczę-sercem-cms.onrender.com`)
10. Wróć do zmiennych środowiskowych i uzupełnij `PUBLIC_URL` tym URL-em
11. Otwórz `https://twój-render-url/admin` → zaloguj się → powinieneś zobaczyć panel Directus

---

### Krok 3 — Import schematu bazy danych

Po zalogowaniu do Directus:

1. Przejdź do **Settings → Data Model** — powinno być puste
2. Otwórz terminal na swoim komputerze i uruchom:

```bash
# Zainstaluj narzędzie (jednorazowo)
npm install -g directus

# Zaloguj się do swojej instancji Directus
npx directus login https://twój-render-url

# Zaimportuj schemat (wszystkie kolekcje zostaną utworzone automatycznie)
npx directus schema apply ./directus/schema-snapshot.json
```

> Jeśli polecenie `directus` nie działa, użyj metody alternatywnej:
> W panelu Directus → Settings → Data Model → kliknij ikonę importu schematu (⬆️) i wgraj plik `directus/schema-snapshot.json`

3. Po imporcie odśwież panel — powinny pojawić się kolekcje: Koty, Aktualności, Menu, itp.

---

### Krok 4 — Konfiguracja Directus po imporcie

#### Wygeneruj token API (potrzebny dla Next.js)
1. Settings → Users → kliknij swojego admina
2. Przewiń do sekcji **Token**
3. Kliknij **Generate token** → skopiuj i zapisz

#### Dodaj języki
1. Settings → Data Model → szukaj kolekcji `languages`
2. Dodaj: `pl` (Polish) i `en` (English)

#### Dodaj podstawowe dane
W panelu dodaj:
- **Site Settings** — nazwa strony, baner, logo
- **Menu Items** — Strona główna (`/`), Koty (`/cats`), Aktualności (`/news`), O nas (`/about`), Kontakt (`/contact`)
- **Social Links** — Facebook, Instagram itp.
- **Adoption Questions** — pytania formularza adopcyjnego (domyślne są już w bazie)

---

### Krok 5 — Vercel (frontend Next.js)

1. Przejdź na https://vercel.com → **Add New Project**
2. Wybierz swoje repozytorium `HiddenMamba/JaPaczeSercemDemo`
3. **Root Directory**: ustaw na `frontend`
4. Framework Preset: **Next.js** (wykryje automatycznie)
5. Dodaj zmienne środowiskowe (**Environment Variables**):

| Klucz | Wartość |
|---|---|
| `DIRECTUS_URL` | URL Render z Kroku 2 (np. `https://ja-cms.onrender.com`) |
| `DIRECTUS_TOKEN` | token z Kroku 4 |
| `DIRECTUS_HOST` | hostname Render bez `https://` (np. `ja-cms.onrender.com`) |
| `RESEND_API_KEY` | z https://resend.com (opcjonalne — do formularza kontaktowego) |
| `CONTACT_EMAIL` | twój email kontaktowy |
| `NEXT_PUBLIC_SITE_URL` | URL Vercel (uzupełnij po deploymencie) |
| `NEXT_PUBLIC_SITE_NAME` | Ja Paczę Sercem |
| `NEXT_PUBLIC_DIRECTUS_URL` | URL Render z Kroku 2 |

6. Kliknij **Deploy** — poczekaj ~2 minuty
7. Skopiuj URL Vercel (np. `https://ja-paczę-sercem.vercel.app`)
8. Wróć do Render → Environment Variables → uzupełnij `CORS_ORIGIN` URL-em Vercel
9. Wróć do Vercel → Environment Variables → uzupełnij `NEXT_PUBLIC_SITE_URL` URL-em Vercel
10. W Vercel → **Redeploy** (po uzupełnieniu zmiennych)

---

### Krok 6 — UptimeRobot (zapobieganie uśpieniu Render)

Bezpłatny Render usypia usługę po 15 minutach bezczynności. Rozwiązanie:

1. Przejdź na https://uptimerobot.com → Zarejestruj się (bezpłatnie)
2. **Add New Monitor**:
   - Monitor type: **HTTP(s)**
   - Friendly name: `Directus CMS`
   - URL: `https://twój-render-url/server/ping`
   - Monitoring interval: **5 minutes**
3. Kliknij **Create Monitor**

Directus będzie teraz zawsze aktywny.

---

### Krok 7 — Domena i SSL (opcjonalne dla demo)

Jeśli masz domenę:

1. Przejdź na https://cloudflare.com → dodaj swoją domenę (bezpłatny plan)
2. W Vercel → Project → **Domains** → dodaj swoją domenę
3. W Cloudflare → DNS → dodaj rekord CNAME wskazany przez Vercel
4. Włącz **Proxy** (pomarańczowa chmurka) → bezpłatny SSL + CDN
5. W Cloudflare → SSL/TLS → ustaw **Full (strict)**

---

## 🖥️ CZĘŚĆ 2 — Serwer produkcyjny (VPS OVH ~4GB RAM)

### Wymagania
- Ubuntu 22.04+
- Docker + Docker Compose
- Domena wskazująca na IP serwera

### Krok 1 — Przygotowanie serwera

```bash
# SSH na serwer
ssh user@twoje-ip

# Instalacja Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Instalacja Git
sudo apt install -y git

# Klonowanie repozytorium
git clone https://github.com/HiddenMamba/JaPaczeSercemDemo.git ~/ja-paczę-sercem
cd ~/ja-paczę-sercem/cat-adoption
```

### Krok 2 — Konfiguracja środowiska

```bash
cp .env.prod.example .env
nano .env
```

Wypełnij wszystkie wartości:
```env
DOMAIN=twojadomena.pl
SITE_NAME=Ja Paczę Sercem
POSTGRES_PASSWORD=silne_haslo_bazy_danych
DIRECTUS_SECRET=losowy_64_znakowy_ciąg
DIRECTUS_ADMIN_EMAIL=admin@twojadomena.pl
DIRECTUS_ADMIN_PASSWORD=silne_haslo_admina
DIRECTUS_TOKEN=wygeneruj_po_pierwszym_uruchomieniu
RESEND_API_KEY=re_twoj_klucz
CONTACT_EMAIL=kontakt@twojadomena.pl
```

### Krok 3 — DNS

W Cloudflare (lub u swojego rejestratora):
```
A    @    IP_SERWERA
A    www  IP_SERWERA
```

### Krok 4 — Uruchomienie

```bash
cd ~/ja-paczę-sercem/cat-adoption

# Uruchom wszystkie usługi
docker compose up -d

# Sprawdź logi (Ctrl+C aby wyjść)
docker compose logs -f

# Caddy automatycznie pobierze certyfikat SSL (~30 sekund)
# Otwórz: https://twojadomena.pl
```

### Krok 5 — Import schematu i konfiguracja

```bash
# Zaloguj się do panelu: https://twojadomena.pl/cms/admin
# Wygeneruj token w Settings → Users → twoje konto → Token
# Zaktualizuj .env: DIRECTUS_TOKEN=twoj_token
docker compose restart frontend

# Zaimportuj schemat
npx directus schema apply \
  --endpoint https://twojadomena.pl/cms \
  --token TWOJ_TOKEN \
  ./directus/schema-snapshot.json
```

### Krok 6 — Auto-deploy (GitHub Actions)

W repozytorium GitHub → **Settings → Secrets → Actions** dodaj:

| Secret | Wartość |
|---|---|
| `VPS_HOST` | IP serwera |
| `VPS_USER` | nazwa użytkownika SSH |
| `VPS_SSH_KEY` | zawartość `~/.ssh/id_rsa` (klucz prywatny) |
| `VPS_PORT` | `22` |

Teraz każdy `git push` do `main` automatycznie wdroży zmiany na serwerze.

### Przydatne komendy

```bash
# Status usług
docker compose ps

# Restart frontendu
docker compose restart frontend

# Backup bazy danych
docker compose exec postgres pg_dump -U directus catadoption > backup_$(date +%Y%m%d).sql

# Aktualizacja Directus
docker compose pull directus && docker compose up -d directus

# Zatrzymanie wszystkiego
docker compose down
```

---

## 🛠️ Lokalny development

```bash
# 1. Uruchom Directus + Postgres lokalnie
cd cat-adoption
docker compose -f docker-compose.dev.yml up -d

# 2. Skonfiguruj frontend
cd frontend
cp .env.example .env.local
# Edytuj .env.local — ustaw DIRECTUS_TOKEN

# 3. Zainstaluj zależności i uruchom
npm install
npm run dev

# Strona: http://localhost:3000
# Panel Directus: http://localhost:8055/admin
# Login: admin@example.com / admin123
```

---

## 📱 Zarządzanie treścią (dla administratora)

### Panel admina
- **Demo:** `https://twój-render-url/admin`
- **Produkcja:** `https://twojadomena.pl/cms/admin`

### Dodawanie kota
1. Koty → **+ Utwórz**
2. Uzupełnij: Imię, slug (URL), Status, Kategoria, Płeć, Data urodzenia
3. Wgraj zdjęcia (drag & drop)
4. Wybierz cechy (FIV+, nieśmiały, itp.)
5. Zapisz → pojawia się na stronie

### Zarządzanie banerem i logo
1. Site Settings → ustaw Nazwę strony, Logo, Baner
2. Włącz baner → pojawi się na wszystkich podstronach

### Pytania formularza adopcyjnego
1. Adoption Questions → możesz dodawać/edytować/ukrywać pytania
2. Typy pytań: tekstowe, textarea, radio (jeden wybór), wielokrotny wybór
3. Zmień kolejność przez pole "Kolejność"

---

## 💰 Koszty

| Usługa | Demo | Produkcja |
|---|---|---|
| Frontend (Next.js) | Vercel Free | Docker na VPS |
| CMS (Directus) | Render Free | Docker na VPS |
| Baza danych | Neon Free | Docker na VPS |
| SSL | Cloudflare Free | Caddy (Let's Encrypt) |
| Ping/keep-alive | UptimeRobot Free | N/A |
| Email | Resend Free (3k/mies.) | Resend Free |
| **Razem** | **0 zł/miesiąc** | **koszt VPS (~20-60 zł/mies.)** |

---

## 🔒 Checklista bezpieczeństwa przed wdrożeniem

- [ ] Zmień wszystkie domyślne hasła w `.env`
- [ ] Wygeneruj silny `DIRECTUS_SECRET` (64+ znaków)
- [ ] Ustaw `DIRECTUS_TOKEN` na unikalną wartość
- [ ] Cloudflare SSL → **Full (strict)**
- [ ] Skonfiguruj backup bazy danych (cron)
- [ ] Ogranicz uprawnienia edytora w Directus (nie dawaj admina wolontariuszom)
- [ ] Sprawdź czy formularze kontaktowe działają
- [ ] Nigdy nie commituj pliku `.env` do repozytorium
