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
echo "  3) patch-cat-status.sh  - add inTreatment status to cats dropdown"
echo "  4) patch-page-style.sh  - add page_style (colours/fonts) + emoji picker for cat traits"
echo "  5) setup.sh             - FULL setup: schema + permissions + seed (fresh instance only!)"
echo ""
read -p "Choose [1/2/3/4/5]: " CHOICE

if [ "$CHOICE" = "1" ]; then
  bash directus/seed.sh
elif [ "$CHOICE" = "2" ]; then
  bash directus/patch-labels.sh
elif [ "$CHOICE" = "3" ]; then
  bash directus/patch-cat-status.sh
elif [ "$CHOICE" = "4" ]; then
  bash directus/patch-page-style.sh
elif [ "$CHOICE" = "5" ]; then
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
  echo "  bash directus/setup.sh  (fresh instances only)"
fi
