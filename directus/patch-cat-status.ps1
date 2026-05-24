# Add inTreatment to cats.status dropdown on an existing Directus instance
param(
  [string]$DirectusUrl = "http://localhost:8055",
  [string]$Email = "admin@example.com",
  [string]$Password = "admin123"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Patch cats.status - add inTreatment"
Write-Host "   Target: $DirectusUrl"
Write-Host ""

$login = Invoke-RestMethod -Uri "$DirectusUrl/auth/login" -Method POST -ContentType "application/json" `
  -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)
$token = $login.data.access_token
$headers = @{ Authorization = "Bearer $token" }

$choices = @{
  choices = @(
    @{ text = "Dostepny"; value = "available" },
    @{ text = "W trakcie leczenia"; value = "inTreatment" },
    @{ text = "Zarezerwowany"; value = "reserved" },
    @{ text = "Adoptowany"; value = "adopted" },
    @{ text = "Za teczowym mostem"; value = "rainbow" }
  )
}

$body = @{ meta = @{ options = $choices } } | ConvertTo-Json -Depth 10 -Compress
$result = Invoke-RestMethod -Uri "$DirectusUrl/fields/cats/status" -Method PATCH -Headers $headers `
  -ContentType "application/json; charset=utf-8" -Body $body

if ($result.data) {
  Write-Host "cats.status choices updated (inTreatment added)"
} else {
  throw "Update failed"
}
Write-Host ""
