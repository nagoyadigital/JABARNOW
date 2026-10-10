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

### Status Tahap 1
- Scaffold, design tokens, fonts, shell publik & CMS: **selesai**.
- Build dan lint: **lulus**.
- Homepage lengkap & fitur backend: tahap berikutnya (menunggu lanjut).
