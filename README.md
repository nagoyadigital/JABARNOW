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
```

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
- Build & lint: **lulus** di setiap tahap.

### Dependency utama
- Next.js 16, React 19, TypeScript, Tailwind v4
- Prisma 6 + PostgreSQL (Supabase)
- Auth.js v5 (NextAuth) + bcryptjs
- Tiptap (block editor) + isomorphic-dompurify (sanitasi)
- @aws-sdk/client-s3 (Cloudflare R2, S3-compatible)
- zod (validasi)

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

### Push ke GitHub (butuh akun Anda)
```bash
# repo & commit sudah siap lokal; tinggal autentikasi lalu:
git push -u origin main
```
