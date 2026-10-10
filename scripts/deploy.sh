#!/usr/bin/env bash
# Deploy JabarNow! di VPS (Node + PM2).
# Pakai: bash scripts/deploy.sh
set -euo pipefail

echo "==> Pull kode terbaru"
git pull origin main

echo "==> Install dependency (production + build tools)"
npm ci

echo "==> Prisma generate + migrate (deploy)"
npx prisma generate
npx prisma migrate deploy

echo "==> Build Next.js (standalone)"
npm run build

# output:"standalone" TIDAK menyalin public/ dan .next/static otomatis.
echo "==> Salin aset statis ke standalone"
cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static

echo "==> Restart via PM2"
if pm2 describe jabarnow > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

echo "==> Selesai. Cek: pm2 logs jabarnow"
