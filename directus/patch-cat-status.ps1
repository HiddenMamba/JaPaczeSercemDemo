# Remove reserved from cats.status on an existing Directus instance
param(
  [string]$DirectusUrl = "http://localhost:8055",
  [string]$Email = "admin@example.com",
  [string]$Password = "admin123"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Patch cats.status - remove reserved"
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
    @{ text = "Adoptowany"; value = "adopted" },
    @{ text = "Za teczowym mostem"; value = "rainbow" }
  )
}

$body = @{ meta = @{ options = $choices } } | ConvertTo-Json -Depth 10 -Compress
$result = Invoke-RestMethod -Uri "$DirectusUrl/fields/cats/status" -Method PATCH -Headers $headers `
  -ContentType "application/json; charset=utf-8" -Body $body

if ($result.data) {
  Write-Host "cats.status choices updated (reserved removed)"
} else {
  throw "Update failed"
}

$reservedCats = Invoke-RestMethod -Uri "$DirectusUrl/items/cats?filter[status][_eq]=reserved&fields=id&limit=-1" -Headers $headers
if ($reservedCats.data.Count -gt 0) {
  foreach ($cat in $reservedCats.data) {
    $update = Invoke-RestMethod -Uri "$DirectusUrl/items/cats/$($cat.id)" -Method PATCH -Headers $headers `
      -ContentType "application/json; charset=utf-8" -Body '{"status":"available"}'
    if ($update.data) {
      Write-Host "Updated cat $($cat.id) to available"
    } else {
      throw "Could not update cat $($cat.id)"
    }
  }
} else {
  Write-Host "No cats with reserved status found"
}

Write-Host ""
