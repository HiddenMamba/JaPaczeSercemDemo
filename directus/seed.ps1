# Windows-friendly seed (same data as seed.sh)
param(
  [string]$DirectusUrl = "http://localhost:8055",
  [string]$Email = "admin@example.com",
  [string]$Password = "admin123"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Ja Pacze Sercem - Directus Seed (PowerShell)"
Write-Host "   Target: $DirectusUrl"
Write-Host ""

$login = Invoke-RestMethod -Uri "$DirectusUrl/auth/login" -Method POST -ContentType "application/json" `
  -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)
$token = $login.data.access_token
Write-Host "Authenticated"

$headers = @{ Authorization = "Bearer $token" }

function Test-DirectusOk($result) { $null -ne $result.data }

function Invoke-Post($collection, $data) {
  $body = if ($data -is [string]) { $data } else { $data | ConvertTo-Json -Depth 20 -Compress }
  $result = Invoke-RestMethod -Uri "$DirectusUrl/items/$collection" -Method POST -Headers $headers `
    -ContentType "application/json; charset=utf-8" -Body $body
  if (Test-DirectusOk $result) { Write-Host "   OK $collection" } else { Write-Host "   FAIL $collection" }
}

function Invoke-PostIfEmpty($collection, $data) {
  $count = Invoke-RestMethod -Uri "$DirectusUrl/items/${collection}?aggregate[count]=id&limit=1" -Headers $headers
  $n = $count.data[0].count.id
  if ([string]$n -eq "0" -or -not $n) { Invoke-Post $collection $data }
  else { Write-Host "   ~ $collection (skipped - already has data)" }
}

function Invoke-PatchSingleton($collection, $data) {
  $body = if ($data -is [string]) { $data } else { $data | ConvertTo-Json -Depth 20 -Compress }
  try {
    $result = Invoke-RestMethod -Uri "$DirectusUrl/items/$collection" -Method PATCH -Headers $headers `
      -ContentType "application/json; charset=utf-8" -Body $body
    if (Test-DirectusOk $result) { Write-Host "   OK $collection (updated)"; return }
  } catch { }
  Invoke-Post $collection $data
}

Write-Host "`n=== Site Settings ==="
Invoke-PatchSingleton site_settings @{
  site_name = "Ja Pacze Sercem"
  tagline = "Daj kotu dom na zawsze"
  banner_enabled = $true
  banner_text = "Adoptuj kota i daj mu dom na zawsze!"
  banner_color = "orange"
  founded_year = 2020
  cats_adopted_before_website = 47
  contact_form_enabled = $true
  contact_email_visible = $false
  contact_email = "kontakt@japacze.pl"
}

Write-Host "`n=== Cat Traits ==="
@(
  @{ icon = "🦠"; label = "FIV+" },
  @{ icon = "🫣"; label = "Niesmiały" },
  @{ icon = "👁️"; label = "Jednooki" },
  @{ icon = "🍽️"; label = "Potrzebuje diety" },
  @{ icon = "💊"; label = "Leczenie przewlekle" },
  @{ icon = "🏠"; label = "Tylko dom" },
  @{ icon = "🐾"; label = "Przyjazny psom" },
  @{ icon = "👶"; label = "Przyjazny dzieciom" }
) | ForEach-Object { Invoke-PostIfEmpty cat_traits $_ }

Write-Host "`n=== Menu Items ==="
Invoke-PostIfEmpty menu_items @{ label = "Strona główna"; url = "/"; order = 1; open_in_new_tab = $false }
Invoke-PostIfEmpty menu_items @{ label = "Adoptuj kota"; url = "/koty"; order = 2; open_in_new_tab = $false }
Invoke-PostIfEmpty menu_items @{ label = "Aktualności"; url = "/aktualnosci"; order = 3; open_in_new_tab = $false }

Write-Host "`n=== Demo Cats ==="
@(
  @{
    slug = "luna"; name = "Luna"; status = "available"; gender = "female"; category = "adult"
    date_of_birth = "2021-03-15"
    description = "Luna to spokojna i lagodna kotka szukajaca cichego domu."
    story = "Luna trafila do nas po wyjezdzie wlasciciela."
  },
  @{
    slug = "puszek"; name = "Puszek"; status = "inTreatment"; gender = "male"; category = "adult"
    date_of_birth = "2019-08-12"
    description = "Puszek wraca do zdrowia po zabiegu."
    story = "Aktualnie jest pod opieka weterynarza fundacji."
  },
  @{
    slug = "oliver"; name = "Oliver"; status = "available"; gender = "male"; category = "adult"
    date_of_birth = "2020-06-01"
    description = "Oliver to energiczny kocur z duza osobowoscia."
    story = "Znaleziony jako bezdomny w centrum miasta."
  },
  @{
    slug = "mruczek"; name = "Mruczek"; status = "available"; gender = "male"; category = "kitten"
    date_of_birth = "2025-01-10"
    description = "Mruczek to ciekawski kociak pelen energii."
    story = $null
  }
) | ForEach-Object { Invoke-PostIfEmpty cats $_ }

Write-Host "`n=== Public read (cats, files) ==="
try {
  $roles = Invoke-RestMethod -Uri "$DirectusUrl/roles?filter[name][_eq]=Public&fields=id" -Headers $headers
  $publicRole = $roles.data[0].id
  if ($publicRole) {
    foreach ($col in @("directus_files", "cats", "cats_files", "cats_traits", "cat_traits", "news", "pages", "menu_items", "social_links", "site_settings", "adoption_questions", "support_methods")) {
      try {
        Invoke-RestMethod -Uri "$DirectusUrl/permissions" -Method POST -Headers $headers -ContentType "application/json" `
          -Body (@{ role = $publicRole; collection = $col; action = "read"; fields = @("*") } | ConvertTo-Json) | Out-Null
        Write-Host "   OK public read: $col"
      } catch { Write-Host "   ~ $col (may already exist)" }
    }
  }
} catch {
  Write-Host "   Set public read in Directus admin: Settings -> Access Policies -> Public"
}

Write-Host "`nSeed complete."
Write-Host "Next: add cat photos at $DirectusUrl/admin (Koty -> edit -> Zdjecia)"
Write-Host ""
