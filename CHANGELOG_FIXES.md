# Catatan Perbaikan — JabarNow!

Entri terbaru di paling atas. Cari riwayat dengan
`grep -n -i "<gejala|komponen>" CHANGELOG_FIXES.md`.

### Fix #2 — CI gagal di Typecheck: `LayoutProps` tak dikenal karena tipe rute belum dibuat

| | |
|---|---|
| **Tanggal** | 2026-10-23 |
| **File** | `package.json` (script `typecheck`) |
| **Masalah** | Job CI `check` gagal di langkah Typecheck: `src/app/layout.tsx(59,50): error TS2304: Cannot find name 'LayoutProps'`. Sudah gagal di `main` (378081e) sebelum PR #1; langkah Unit test & Build tak pernah sempat berjalan. Di lokal lolos. |
| **Akar** | `LayoutProps`/`PageProps` adalah tipe global yang DIBUAT Next.js 16 saat `next dev`, `next build`, atau `next typegen` (ke `.next/types`). CI menjalankan `tsc --noEmit` sebelum build, di checkout bersih tanpa `.next` → tipe belum ada. Lokal lolos hanya karena `.next` sisa dev server. |
| **Fix** | Script `typecheck` → `next typegen && tsc --noEmit` (tipe rute dibuat dulu; berlaku di CI & lokal, workflow tidak diubah). |
| **Verifikasi** | Reproduksi di git worktree bersih (tanpa `.next`) dengan env CI: tanpa typegen → error TS2304 yang sama; dengan fix → `npm ci`, lint, typecheck, test (15/15), dan `npm run build` semuanya exit 0. Hasil CI GitHub: PENDING verifikasi (menunggu run PR #1 setelah push). |
| **Pelajaran** | Jangan andalkan `.next` lokal saat menilai typecheck; uji di checkout bersih. Tipe global Next (PageProps/LayoutProps/RouteContext) wajib `next typegen` sebelum `tsc`. |
| **Log Keyword** | CI, typecheck, LayoutProps, PageProps, TS2304, next typegen, public-layout-infogarut |
| **Deploy** | BELUM DEPLOY — di branch `feat/layout-infogarut` (PR #1). |

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
