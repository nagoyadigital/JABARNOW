# JabarNow! — Website Berita & CMS

**Developer:** [Nagoya Digital](https://nagoyadigital.com)  
**Dokumentasi:** Kiro Specification V3.1  
**Status:** Spesifikasi desain dan CMS; bukan bukti implementasi atau deployment.

## Tentang proyek
JabarNow! adalah rancangan portal berita Jawa Barat dengan homepage responsif dan CMS redaksi. Desain homepage desktop 1440px dan mobile 390px telah disetujui sebagai acuan. Sejumlah halaman CMS selain Overview dan Editor masih membutuhkan validasi detail sebelum dinyatakan final.

## Fitur yang direncanakan
- Homepage berita: hero 1+2, berita terbaru, Most Read 24 Jam/7 Hari, Jabar Hari Ini, kategori pilihan, footer gelap.
- CMS: dashboard, visual block editor, review & persetujuan, Media Library, Ads Manager, SEO Manager, Analytics, Users & Roles, Website Settings.
- Dukungan 27 kabupaten/kota dalam CMS dan halaman Wilayah, tanpa direktori panjang di homepage.
- SEO advanced terintegrasi, iklan manual, workflow editorial fleksibel, CMS mobile lengkap.
- Logo dan favicon diunggah manual oleh Super Admin.

## Mulai menggunakan di Kiro
1. Letakkan folder ini di repository (contoh: `docs/jabarnow/`).
2. Buka `KIRO-MASTER-PROMPT.md` dan minta Kiro membaca seluruh file spesifikasi.
3. Lampirkan mockup yang disetujui dan aset logo asli secara terpisah.
4. Minta audit repository dan rencana kerja sebelum menulis kode.
5. Jangan mengubah warna, tipografi, layout, atau hak akses desain tanpa persetujuan Super Admin.

## Indeks dokumentasi
- `00`–`06`: design lock, design tokens, homepage, komponen, governance, QA.
- `07`–`09`: CMS overview, block editor, review & permissions.
- `10`–`12`: media, ads, SEO, analytics, users, settings.
- `13`–`14`: CMS mobile, QA, fase pekerjaan, acceptance criteria.
- `KIRO-MASTER-PROMPT.md`: instruksi kerja utama Kiro.
- `COPYRIGHT.md`: atribusi developer dan ketentuan hak cipta.

## Status dan batasan
Dokumen ini tidak menentukan stack teknologi secara sepihak. README teknis (instalasi, environment, build, deploy) perlu dilengkapi setelah stack dan repository dikonfirmasi. Mockup AI adalah referensi visual; detail yang tidak disetujui bukan fitur wajib.

## Developer
**Nagoya Digital** — https://nagoyadigital.com

© 2026 Nagoya Digital. All Rights Reserved. Lihat `COPYRIGHT.md` untuk ruang lingkup atribusi.

---

## Dokumentasi teknis (Tahap 1 — Design Foundation)

Bagian ini mencerminkan stack yang benar-benar terpasang di repository, bukan asumsi.

### Stack terpasang
- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** (design tokens terkunci dipetakan di `src/app/globals.css`)
- **Fonts:** Plus Jakarta Sans (judul) + Inter (body/UI) via `next/font`
- Deploy target: **Vercel**; repo: `github.com/nagoyadigital/JABARNOW`

### Stack direncanakan (tahap berikut, belum terpasang)
- **Database + Auth:** Supabase (Postgres) + Prisma + Auth.js (email/password)
- **Storage media:** Cloudflare R2 (S3-compatible, via storage adapter)
- **Editor artikel:** Tiptap (block-based) + sanitasi server-side
- Integration-ready (opsional, colok nanti): GA4, Google Search Console

### Struktur folder
```
src/
  app/
    (public)/        # shell publik: layout, homepage
    cms/             # shell CMS: layout, overview (noindex)
    robots.ts        # robots.txt
    sitemap.ts       # sitemap.xml
    layout.tsx       # root: fonts + metadata SEO global
    globals.css      # design tokens terkunci (@theme Tailwind v4)
  components/
    brand/           # BrandLogo (logo resmi, jaga rasio)
    common/          # WibDate (klien, zona Asia/Jakarta)
    public/          # SiteHeader, SiteFooter, MobileBottomNav
    cms/             # CmsSidebar, CmsTopbar
  lib/
    site-config.ts   # konfigurasi situs + atribusi Nagoya Digital
    navigation.ts    # nav publik + footer 4 kelompok (terkunci)
    cms-navigation.ts# navigation map CMS + permission (acuan)
    ai/              # AI Desk: scout, parser feed, normalisasi, log agent, adapter LLM
    social/          # Studio Sosmed: generator paket, template slide, render PNG
  assets/            # font brand (OFL) & logo kecil untuk render slide sosmed
docs/jabarnow/       # 17 dokumen spesifikasi (source of truth)
public/brand/logo.png# logo resmi (placeholder sebelum upload CMS)
```

### Menjalankan secara lokal
```bash
npm install
cp .env.example .env   # isi nilai bila fitur backend sudah dibutuhkan
npm run dev            # http://localhost:3000
npm run build          # build produksi
npm run lint           # ESLint
npm run typecheck      # cek tipe TypeScript
npm test               # tes unit (node:test, folder tests/)
```

CI GitHub Actions (`.github/workflows/ci.yml`) menjalankan lint, cek tipe,
tes unit, dan build untuk setiap push/PR ke `main`.

### Environment variables
Lihat `.env.example` untuk daftar lengkap (Supabase, Cloudflare R2, Auth.js,
GA4/GSC opsional). File `.env` tidak di-commit.

### Status pengembangan (Tahap 1–6 selesai)
- **Tahap 1** Design foundation: tokens, fonts, shell publik & CMS. ✓
- **Tahap 2** Homepage publik desktop V2.0 & mobile V2.1. ✓
- **Tahap 3** CMS foundation: Prisma + Auth.js + RBAC 8 role + audit log. ✓
- **Tahap 4** Editorial: Tiptap block editor, Media Library (R2), workflow
  Simple/Advanced, review queue, scheduling WIB, autosave, sanitasi. ✓
- **Tahap 5** SEO Manager (sitemap/news-sitemap/schema/redirect), Ads Manager
  (manual placement + jadwal), Analytics (GA4 integration-ready). ✓
- **Tahap 6** Halaman publik sisa (kategori/wilayah/author/search/legal),
  Users & Roles, Settings, Komentar, Audit Log, mobile CMS. ✓
- **Tahap 7** AI Desk — Sumber Berita + Scout: kelola feed RSS/Atom/Google
  Trends, Scout terjadwal (cron) + tombol manual, dedup URL & judul lintas
  portal, Radar Topik, Ruang Redaksi AI, log agent. Artikel AI hanya bisa
  diputuskan Pemimpin Redaksi / Super Admin. ✓
- **Studio Sosmed** — setiap artikel yang disetujui otomatis dibuatkan feed
  1 slide + carousel (headline, kata sorotan, isi slide, caption, hashtag),
  3 template bermerek, editor + render ulang, download PNG, Brand Kit,
  approval Pimred. AI opsional lewat adapter (API sendiri). ✓
- Build & lint: **lulus** di setiap tahap.

### Dependency utama
- Next.js 16, React 19, TypeScript, Tailwind v4
- Prisma 6 + PostgreSQL (Supabase)
- Auth.js v5 (NextAuth) + bcryptjs
- Tiptap (block editor) + isomorphic-dompurify (sanitasi)
- @aws-sdk/client-s3 (Cloudflare R2, S3-compatible)
- zod (validasi)
- fast-xml-parser (parser feed RSS/Atom untuk AI Desk)

### Mengaktifkan database & storage (yang perlu Anda lakukan)
1. **Supabase**: buat project → salin `DATABASE_URL` (pooled) & `DIRECT_URL`
   (direct) ke `.env`.
2. **Super Admin**: isi `SEED_SUPERADMIN_EMAIL` & `SEED_SUPERADMIN_PASSWORD`.
3. Jalankan: `npm run db:migrate` lalu `npm run db:seed`.
4. **Cloudflare R2**: buat bucket + API token → isi `R2_*` di `.env` untuk
   mengaktifkan upload media.
5. **Auth**: generate `AUTH_SECRET` (`npx auth secret`), set `AUTH_URL`.
6. Login di `/login` → masuk CMS di `/cms`.

### Opsional (colok kapan saja)
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` → aktifkan Google Analytics 4.
- `GSC_VERIFICATION` → verifikasi Google Search Console. Submit
  `https://jabarnow.id/sitemap.xml` & `/news-sitemap.xml` di GSC.

## Audit & perapian (23 Okt 2026)

Ringkasan perubahan dari audit kode, SEO, dan keamanan:

- **Keamanan:** role/status user dicek ulang ke DB tiap menit (user yang
  di-suspend langsung keluar), batas percobaan login (5 gagal/15 menit per
  email, 20 per IP), header keamanan (nosniff, frame, referrer, HSTS,
  permissions), upload dicek dari isi file (magic bytes), batas komentar
  5/10 menit, Next.js 16.4.2 & DOMPurify 3.4.17 (patch kerentanan kritis).
- **SEO:** JSON-LD aman dari injeksi + `publisher.logo`, BreadcrumbList,
  WebSite + SearchAction; sitemap mencakup kategori/wilayah/tag; news-sitemap
  di robots.txt; RSS `/feed.xml`; gambar OG default; h1 & meta description di
  halaman arsip; slug tak dikenal → 404 asli; tag tipis → noindex.
- **Konten & iklan:** konten contoh hanya di mode demo (produksi tanpa artikel
  tidak menampilkan berita palsu); Most Read memakai data nyata + penghitung
  views (bot tidak dihitung); kampanye Ads Manager kini tampil di situs, kotak
  "Area Iklan" hanya di mode pratinjau.
- **Halaman baru:** `/terbaru`, `/populer`, CMS Kategori, Tag, Wilayah
  (sebelumnya tautan menu mengarah ke 404).
- **Build:** tidak lagi gagal bila database tidak bisa diakses saat build.

Mode demo diatur lewat `NEXT_PUBLIC_DEMO_CONTENT` dan `NEXT_PUBLIC_ADS_PREVIEW`
(lihat `.env.example`). Laporan lengkap: dokumen "Audit JabarNow!".

## AI Desk — Redaksi Otomatis (Tahap 7+)

AI Desk menjalankan "redaksi AI" di dalam CMS: agent mencari topik, menilai,
menulis, dan mendesain; **Pemimpin Redaksi yang memutuskan**. Artikel AI
masuk ke alur review yang sudah ada (`/cms/review`) dan tidak pernah tayang
tanpa approval.

```
Sumber Berita ─▶ Scout ─▶ Analis ─▶ Copywriter ─▶ Designer ─▶ Review Pimred ─▶ Jadwal/Tayang ─▶ Sosmed
  (Tahap 7)     (Tahap 7)  (Tahap 8)   (Tahap 9)    (Tahap 10)   (sudah ada)     (sudah ada)    (Tahap 11)
```

### Yang sudah aktif (Tahap 7)
| Bagian | Lokasi | Keterangan |
| --- | --- | --- |
| Ruang Redaksi AI | `/cms/ai-desk` | Statistik 24 jam, status agent, log aktivitas, tombol "Cari topik sekarang" |
| Radar Topik | `/cms/ai-desk/radar` | Semua topik hasil Scout, filter status, cari judul, abaikan/kembalikan |
| Sumber Berita | `/cms/ai-desk/sumber` | Tambah feed (RSS/Atom/Trends), "Cek feed", aktif/nonaktif, cek per sumber, statistik 7 hari, pesan error |
| Scout (cron) | `POST /api/cron/ai-scout` | Ambil semua sumber aktif, buang item > 48 jam, dedup, simpan `Topic`, ambil `og:image` |

**Cara kerja Scout**
- Format feed dideteksi otomatis: RSS 2.0, Atom, RSS 1.0 (RDF), Google Trends RSS
  (tiap berita terkait sebuah tren menjadi satu topik).
- Dedup dua lapis: URL kanonik (parameter `utm_*`, `fbclid`, dll. dibuang) dan
  judul ternormalisasi, sehingga berita sama dari dua portal hanya masuk sekali.
- Batas aman: timeout 15 detik & maks 3 MB per feed, 4 sumber paralel, hanya
  URL http/https publik (host lokal/privat ditolak).
- Putaran tidak tumpang tindih: bila Scout masih berjalan, cron berikutnya
  dilewati; putaran macet > 15 menit ditandai error otomatis.
- Setiap putaran tercatat di tabel `AgentRun` (dasar status agent & biaya AI).

### Hak akses
| Izin | Role | Untuk |
| --- | --- | --- |
| `ai.manage` | Super Admin, Administrator, Pemimpin Redaksi | Kelola sumber, Radar, menjalankan Scout |
| `ai.approve` | **Super Admin, Pemimpin Redaksi** | Approve / revisi / tolak / publish artikel tulisan AI |

Artikel AI dikenali dari relasi `Topic` → `Article`. Editor tetap bisa membaca
dan mengedit, tapi tombol keputusan diganti catatan "menunggu keputusan
Pemimpin Redaksi", dan server menolak keputusan tanpa `ai.approve`.

### Mengaktifkan
1. Deploy seperti biasa (`bash scripts/deploy.sh`) — migrasi
   `20261023090000_ai_desk_scout` ikut dijalankan oleh `prisma migrate deploy`.
   Migrasi ini hanya **menambah** tabel (`NewsSource`, `Topic`, `AgentRun`),
   tidak mengubah data lama.
2. Tambahkan baris cron AI Desk dari `deploy/crontab.example` (tiap 15 menit).
3. Masuk sebagai Super Admin → **AI Desk → Sumber Berita** → tambah feed,
   klik **Cek feed** dulu untuk memastikan feed terbaca.
4. Klik **Cari topik sekarang**, lalu lihat hasilnya di **Radar Topik**.

Contoh sumber untuk dicoba (URL feed portal bisa berubah — selalu pakai
tombol **Cek feed** sebelum menyimpan):
- Google Trends Indonesia (tipe Trends): `https://trends.google.com/trending/rss?geo=ID`
- Feed RSS kanal Jawa Barat dari portal nasional/lokal (Antara Jabar, Detik
  Jabar, Pikiran Rakyat, Tribun Jabar, dll.) — cari tautan "RSS" di situsnya.
- Situs resmi Pemprov/Pemkot/Pemkab yang menyediakan RSS rilis berita.

Pengaturan lanjutan lewat env (opsional): `AI_SCOUT_MAX_AGE_HOURS`,
`AI_SCOUT_TITLE_DEDUP_HOURS`, `AI_SCOUT_MAX_ITEMS_PER_SOURCE`,
`AI_SCOUT_OG_IMAGE_LIMIT`, `AI_SCOUT_FETCH_TIMEOUT_MS` (lihat `.env.example`).

## Studio Sosmed — Feed & Carousel Otomatis

Setiap artikel yang **disetujui / tayang** otomatis dibuatkan dua konten:

| Format | Isi | Ukuran |
| --- | --- | --- |
| Feed 1 slide | Cover: foto + headline (+ kicker, kata sorotan) | 1080 × 1350 (4:5) |
| Carousel | Cover + 1–5 slide isi + slide penutup (CTA) | 1080 × 1350 per slide |

Plus headline sosmed + alternatif, caption, dan hashtag. Semua masuk
**Studio Sosmed → Antrian Sosmed** dengan status *Perlu review*.

**Alur:** artikel di-approve → paket dibuat (di latar belakang) → editor cek &
edit (template, headline, kata sorotan, isi slide, caption) → **Pimred / Super
Admin menyetujui** → unduh PNG + salin caption (posting otomatis ke
IG/TikTok/Threads/FB menyusul di tahap penjadwalan).

**Template** (`src/lib/social/templates.tsx`): *Kotak Putih* (foto + kotak
headline putih), *Sorot Gelap* (gradasi gelap + headline kapital, kata
sorotan oranye), *Breaking* (label merah + panel gelap). Warna mengikuti design
token, font Plus Jakarta Sans + Inter (lisensi OFL, di `src/assets/fonts`).

**Gambar** dirender saat diminta oleh `GET /api/sosmed/render/:id/:slide`
memakai `next/og` — tidak perlu Chromium/server tambahan dan tidak menumpuk
file di storage. URL ditandatangani HMAC (`AUTH_SECRET`) dan ber-versi, jadi
bisa dibuka platform sosmed tanpa login, aman di-cache, dan otomatis berganti
saat konten atau Brand Kit diubah.

**Foto latar** memakai cover artikel yang sudah disetujui (bukan foto dari
media lain). Bisa dimatikan per konten → template tipografi.

**Penulis konten:**
- **Dengan AI** (isi `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`): headline sosmed
  + 2 alternatif, kata sorotan, kicker, isi slide, caption & hashtag ditulis AI
  hanya dari isi artikel yang sudah disetujui. Token & biaya tercatat di
  `AgentRun`. Bila AI gagal, otomatis jatuh ke jalur tanpa AI.
- **Tanpa AI**: disusun dari judul, ringkasan, dan paragraf awal (dateline
  dibuang), hashtag dari wilayah/kategori/tag.

Adapter AI (`src/lib/ai/llm.ts`) mendukung **Anthropic** dan format
**OpenAI-compatible** (OpenAI, OpenRouter, atau API/gateway sendiri lewat
`AI_BASE_URL`). Ganti provider cukup lewat `.env`.

**Brand Kit** (`/cms/sosmed/brand-kit`): handle, judul & teks slide penutup,
template default, jumlah slide isi carousel, hashtag tetap, dan saklar
"buat paket otomatis".

**Hak akses:** `social.manage` (Super Admin, Administrator, Pemimpin Redaksi,
Editor) untuk membuat & mengedit; `social.approve` (**Super Admin & Pemimpin
Redaksi**) untuk menyetujui/menolak. Konten yang diedit setelah disetujui
otomatis kembali ke *Perlu review*.

**Aktivasi:** deploy seperti biasa (migrasi `20261023120000_studio_sosmed`
hanya menambah tabel `SocialPost`), pastikan `AUTH_SECRET` terisi, lalu buka
**Studio Sosmed**. Artikel lama yang sudah tayang bisa dibuatkan paket lewat
tombol **Buat paket sosmed**.

### Berikutnya
- **Penjadwalan & posting otomatis:** sambungkan akun Instagram, Facebook,
  Threads (Meta Graph API) dan TikTok (Content Posting API), kalender jadwal,
  kirim ke banyak akun sekaligus.
- **Tahap 8 — Analis + Brain:** skor 0–100, kategori/wilayah otomatis, flag
  topik sensitif, halaman Brain (gaya & aturan redaksi). Butuh API key AI.
- **Tahap 9 — Copywriter:** artikel gaya media nasional (straight news &
  explainer), cek fakta, cek kemiripan dengan sumber, masuk `/cms/review`.
- **Tahap 10 — Featured image**, **Tahap 11 — Sosmed (Instagram)**,
  **Tahap 12 — mode otomatis & jam kerja**.

### Push ke GitHub (butuh akun Anda)
```bash
# repo & commit sudah siap lokal; tinggal autentikasi lalu:
git push -u origin main
```
