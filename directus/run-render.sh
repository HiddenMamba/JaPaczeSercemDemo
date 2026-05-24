#!/bin/bash
# ── Run Directus scripts interactively ───────────────────────────────────────
# Usage: bash directus/run-render.sh

echo "🐱 Ja Pacze Sercem — Directus Script Runner"
echo ""

read -p "Directus URL [https://ja-pacze-sercem-cms.onrender.com]: " URL
URL=${URL:-https://ja-pacze-sercem-cms.onrender.com}

read -p "Admin email: " EMAIL
read -s -p "Admin password: " PASSWORD
echo ""

export DIRECTUS_URL="$URL"
export DIRECTUS_EMAIL="$EMAIL"
export DIRECTUS_PASSWORD="$PASSWORD"

echo ""
echo "Which script to run?"
echo "  1) seed.sh          — full seed (cats, news, pages, menu, social, questions)"
echo "  2) patch-labels.sh  — Polish field labels + admin language only"
echo ""
read -p "Choose [1/2]: " CHOICE

if [ "$CHOICE" = "1" ]; then
  bash directus/seed.sh
elif [ "$CHOICE" = "2" ]; then
  bash directus/patch-labels.sh
else
  echo "Invalid choice. Run manually:"
  echo "  bash directus/seed.sh"
  echo "  bash directus/patch-labels.sh"
fi
