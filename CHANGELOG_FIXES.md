# Catatan Perbaikan — JabarNow!

Entri terbaru di paling atas. Cari riwayat dengan
`grep -n -i "<gejala|komponen>" CHANGELOG_FIXES.md`.

### Fix #1 — Teks tak terlihat: kelas `text-base` dibaca Tailwind v4 sebagai warna putih

| | |
|---|---|
| **Tanggal** | 2026-10-23 |
| **File** | `src/components/public/search-overlay.tsx`, `src/components/public/highlight-carousel.tsx` |
| **Masalah** | Teks yang diketik di kotak pencarian (overlay cari) dan judul kartu Highlight di HP tak terlihat — putih di atas latar putih. |
| **Akar** | Tema mendefinisikan warna `--color-base: #ffffff`. Di Tailwind v4, `text-base` jadi ambigu dan dihasilkan sebagai `color: var(--color-base)` (putih), bukan ukuran huruf 16px. Kotak cari sudah terkena sejak sebelum 2026-10-23; kartu Highlight terkena saat revisi layout. |
| **Fix** | Ganti `text-base` → `text-[16px]` (ukuran eksplisit; 16px juga mencegah zoom otomatis iOS saat input difokus). |
| **Verifikasi** | Chrome DevTools, viewport 390×844: warna judul kartu Highlight sebelum `rgb(255, 255, 255)` → sesudah `rgb(23, 25, 29)`, ukuran 16px; judul tampil di screenshot. `grep text-base\b src` kini hanya menyisakan `hero.tsx` (komponen tak terpakai, teks memang putih di atas foto). Input cari: akar & kelas identik, belum diukur langsung. |
| **Pelajaran** | Jangan pakai `text-base` di proyek ini. Nama warna tema yang bentrok dengan skala ukuran Tailwind (`base`, `sm`, `lg`, …) membuat utilitas `text-*` ambigu. |
| **Log Keyword** | text-base, teks putih, tak terlihat, --color-base, tailwind v4, public-layout-infogarut |
| **Deploy** | BELUM DEPLOY — belum di-commit (menunggu persetujuan pemilik proyek). |

Catatan terkait (regresi sendiri dalam pekerjaan yang sama, belum di-commit): header mobile
diberi `backdrop-blur` → drawer menu (`position: fixed`) terkurung setinggi header (terlihat
di screenshot 390×844; tinggi saat rusak tidak diukur). Blur dilepas → tinggi drawer terukur
844px (penuh). Jangan beri
`backdrop-filter`/`transform` pada leluhur elemen `fixed`.
