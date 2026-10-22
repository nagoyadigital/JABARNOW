# Panduan Deploy JabarNow! di VPS (Node + PM2 + Nginx)

Target: VPS Ubuntu/Debian. Stack: Next.js (standalone) ⟶ PM2 ⟶ Nginx ⟶ HTTPS.
Database di Supabase, media di Cloudflare R2 (keduanya layanan eksternal,
diakses lewat `.env`).

## 0. Prasyarat akun (dilakukan sekali)
- Project Supabase → punya `DATABASE_URL` & `DIRECT_URL`.
- Bucket Cloudflare R2 → punya `R2_*`.
- Domain `jabarnow.id` diarahkan (A record) ke IP VPS.

## 1. Siapkan server
```bash
# Node 20+ (contoh via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.nvm/nvm.sh && nvm install 20

# PM2 & Nginx
npm i -g pm2
sudo apt update && sudo apt install -y nginx
```

## 2. Clone & konfigurasi
```bash
git clone https://github.com/nagoyadigital/JABARNOW.git jabarnow
cd jabarnow
cp .env.example .env
nano .env   # isi DATABASE_URL, DIRECT_URL, AUTH_SECRET, R2_*, CRON_SECRET, dll.
```
Generate secret:
```bash
npx auth secret            # untuk AUTH_SECRET
openssl rand -base64 32    # untuk CRON_SECRET
```
Set `AUTH_URL=https://jabarnow.id` dan `NEXT_PUBLIC_SITE_URL=https://jabarnow.id`.

## 3. Database (sekali di awal)
```bash
npx prisma migrate deploy
SEED_SUPERADMIN_EMAIL=admin@jabarnow.id SEED_SUPERADMIN_PASSWORD='KataSandiKuat!' npm run db:seed
```

## 4. Build & jalankan (otomatis via skrip)
```bash
bash scripts/deploy.sh
```
Skrip ini: pull → `npm ci` → prisma generate+migrate → build → salin aset
statis ke `.next/standalone` → start/reload PM2.

Cek: `pm2 logs jabarnow` dan `curl -I http://127.0.0.1:3000`.

## 5. Nginx + HTTPS
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/jabarnow
sudo ln -s /etc/nginx/sites-available/jabarnow /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL gratis (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d jabarnow.id -d www.jabarnow.id
```

## 6. Cron publish terjadwal + AI Desk
```bash
crontab -e
# tempel isi deploy/crontab.example, ganti CRON_SECRET & domain
```
Verifikasi manual:
```bash
curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://jabarnow.id/api/cron/publish-scheduled
# -> {"ok":true,"published":N}

curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://jabarnow.id/api/cron/ai-scout
# -> {"ok":true,"created":N,"failedSources":0,"sources":M}
```

## 7. PM2 auto-start saat server reboot
```bash
pm2 startup   # jalankan perintah yang ditampilkan
pm2 save
```

## Update rilis berikutnya
Cukup:
```bash
cd jabarnow && bash scripts/deploy.sh
```

## Catatan
- Jangan commit `.env` (sudah di .gitignore).
- Backup database dilakukan di sisi Supabase.
- Jika upload media gagal: pastikan `R2_*` benar & `client_max_body_size`
  di Nginx cukup (default contoh 15M).
