# Layout publik ala infogarut.id (sidebar kiri + beranda feed)
Status: DITUNDA · Service: web publik (Next.js) · Diperbarui: 2026-10-23 07:05

## Sedang dikerjakan
Sudah di-commit di branch `feat/layout-infogarut` (belum di-push, belum di-merge ke main,
belum deploy). Revisi tampilan berikutnya, bila ada, lanjut di branch ini.

## Status terakhir (apa yang sudah terbukti)
- Sidebar kiri sticky (≥ lg), header + bottom nav mobile (< lg), footer terang selebar layar.
- Beranda: Trending (foto+judul, 1 besar + 4 bernomor) → Highlight carousel → Berita Terbaru
  ringkas 8 item + tombol /terbaru. Kolom kanan: Ikuti Kami → Statistik Portal → iklan.
- typecheck, eslint, 15/15 tes lulus; dicek visual 1440/1024/375px, 11 halaman publik tanpa scroll horizontal.
- Revisi 2: tanpa garis pembatas; logo besar; judul section ikon-lingkaran; motion navigasi
  (kapsul aktif meluncur, View Transitions antar halaman, Wilayah & drawer beranimasi) —
  terukur di Chrome DevTools: transisi 180ms keluar + 420ms masuk, drawer -320→0px.
- Revisi 3: ticker dihapus; mobile disamakan dgn screenshot acuan (header, drawer, trending,
  highlight, footer, header artikel); bottom nav dilepas. 12 halaman publik pas di 390px.
- Revisi 4: halaman artikel ala infogarut (isi 20px justify, kolom kanan penulis → iklan →
  Lainnya di Kategori), banner iklan melayang bawah (placement FOOTER, bisa ditutup),
  blok transparansi di sidebar kiri.
- Override dicatat di docs/CHANGELOG-DESIGN-LOCK.md (entri 2026-10-23).

## Keputusan penting
- Identitas JabarNow (logo, palet, font) dipertahankan; hanya wireframe yang meniru.
- Statistik Portal = total viewCount + jumlah terbit 30 hari (tidak ada log kunjungan harian).
- Video Pilihan dilewati (tak ada data video).

## Langkah berikutnya
- Opsional: halaman profil penulis + bio per penulis (kartu penulis kini memakai teks umum).
- Terapkan revisi lanjutan dari pemilik proyek bila ada.
- Isi URL & jumlah follower akun sosial di src/lib/site-config.ts (`social`).
- Push branch + PR/merge ke main bila pemilik setuju; lalu deploy & ubah status Fix #1 di
  CHANGELOG_FIXES.md menjadi LIVE, dan hapus handoff ini.
- package-lock.json SENGAJA tidak di-commit (npm lokal menghapus field `libc`; bukan bagian layout).
- Opsional: sinkronkan isi docs/jabarnow/00, 02, 03, 04 dengan layout baru.

## Jangan lakukan
- Jangan pakai kelas `text-base` untuk ukuran huruf: tema punya warna `base` (putih), jadi
  Tailwind v4 menjadikannya warna putih. Pakai `text-[16px]`.
- Jangan beri backdrop-filter/transform pada header mobile — drawer `fixed` jadi terkurung.
- Server dev kadang tidak mengompilasi ulang globals.css (aturan baru tak terkirim). Cek CSS
  yang disajikan (curl chunk .css | grep); ubah isi file sedikit untuk memicu kompilasi.
- Panel browser app yang tersembunyi melewati View Transition — uji animasi di Chrome DevTools.
- Jangan commit .env.
- `region-menu.tsx` & `hero.tsx` kini tak dipakai beranda — jangan dihapus tanpa izin.
