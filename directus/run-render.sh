#!/bin/bash
# ── Run Directus scripts interactively ───────────────────────────────────────
# Usage: bash directus/run-render.sh

echo "🐱 Ja Pacze Sercem - Directus Script Runner"
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
echo "  1) seed.sh              - full seed (cats, news, pages, menu, social, questions)"
echo "  2) patch-labels.sh      - Polish field labels + admin language only"
echo "  3) patch-cat-status.sh  - remove reserved and normalize old cats to available"
echo "  4) patch-page-style.sh  - simplify page_style to colors + base font size"
echo "  5) patch-forever-home-photos.sh - add forever-home photos collection"
echo "  6) patch-site-settings.sh - add newer site_settings fields (e.g. 404 image)"
echo "  7) setup.sh             - FULL setup: schema + permissions + seed (fresh instance only!)"
echo ""
read -p "Choose [1/2/3/4/5/6/7]: " CHOICE

if [ "$CHOICE" = "1" ]; then
  bash directus/seed.sh
elif [ "$CHOICE" = "2" ]; then
  bash directus/patch-labels.sh
elif [ "$CHOICE" = "3" ]; then
  bash directus/patch-cat-status.sh
elif [ "$CHOICE" = "4" ]; then
  bash directus/patch-page-style.sh
elif [ "$CHOICE" = "5" ]; then
  bash directus/patch-forever-home-photos.sh
elif [ "$CHOICE" = "6" ]; then
  bash directus/patch-site-settings.sh
elif [ "$CHOICE" = "7" ]; then
  echo "⚠️  WARNING: setup.sh is for FRESH instances only. It may wipe permissions on existing instances."
  read -p "Are you sure? (yes/no): " CONFIRM
  if [ "$CONFIRM" = "yes" ]; then
    bash directus/setup.sh
  else
    echo "Cancelled."
  fi
else
  echo "Invalid choice. Run manually:"
  echo "  bash directus/seed.sh"
  echo "  bash directus/patch-labels.sh"
  echo "  bash directus/patch-cat-status.sh"
  echo "  bash directus/patch-page-style.sh"
  echo "  bash directus/patch-forever-home-photos.sh"
  echo "  bash directus/patch-site-settings.sh"
  echo "  bash directus/setup.sh  (fresh instances only)"
fi
