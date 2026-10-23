# Changelog — Perubahan Design Lock

Dokumen ini mencatat perubahan terhadap keputusan desain yang dikunci
(lihat `00-MASTER-DESIGN-RULES.md`). Setiap entri = override yang disetujui
pemilik proyek.

## 2026-10-23 — Kerangka publik & beranda: sidebar kiri + feed (acuan wireframe infogarut.id)
- **Perubahan:**
  - Desktop (≥ lg/1024px): topbar + header putih + navbar charcoal DIGANTI
    sidebar navigasi kiri sticky (logo, cari, kategori, wilayah, tautan
    informasi). Berlaku di SELURUH halaman publik.
  - Mobile & tablet (< lg): header putih (hamburger · logo · search) +
    bottom nav tetap; batas tampilnya bergeser dari md ke lg.
  - Sidebar kiri juga memuat "Ikuti Kami" (ikon sosial), "Tentang JabarNow!"
    dan "Kerjasama".
  - Tampilan bersih tanpa garis pembatas: sidebar kiri tanpa garis kanan,
    breaking ticker tanpa garis bawah (`breaking-ticker.tsx`).
  - Logo diperbesar: sidebar 88px, header mobile 44px (header mobile juga
    tanpa garis bawah).
  - Judul section: garis aksen oranye DIGANTI ikon dalam lingkaran oranye
    muda + judul kapital berjarak (h2); h1 halaman arsip tetap huruf biasa.
    Ikon: api (Trending/Terpopuler), bintang (Highlight), jam (Terbaru),
    pin (Wilayah), pagar (Tag), kaca pembesar (Cari), koran (default).
  - Motion navigasi: kapsul penanda aktif di sidebar meluncur ke item yang
    diklik (`sidebar-nav.tsx`); pergantian halaman memakai View Transitions
    — konten lama memudar 180ms, baru naik 420ms, sidebar/header/footer
    diam (`page-transition.tsx` + CSS `.jn-page` di `globals.css`); menu
    Wilayah buka/tutup dengan tinggi beranimasi; drawer mobile meluncur
    masuk/keluar. Semua mati bila prefers-reduced-motion.
  - Breaking ticker DIHAPUS dari beranda (dianggap mengganggu); komponen
    `breaking-ticker.tsx` dibiarkan tak terpakai.
  - Mobile disamakan dengan acuan infogarut: header tanpa garis + bayangan
    lembut + tombol cari bulat; drawer berisi logo/tutup, cari, kategori (›),
    wilayah, Ikuti Kami, tautan informasi; Trending di HP = daftar bernomor
    berthumbnail (kartu foto tetap mulai sm); kartu Highlight 82% lebar layar;
    footer satu kolom dengan copyright di tengah. Bottom navigation mobile
    DILEPAS (semula "selalu terlihat") — navigasi HP lewat drawer.
  - Header artikel: breadcrumb "← Beranda › KATEGORI ›" + judul di baris
    sendiri (HP); avatar inisial + label "Penulis" + tanggal/waktu baca/
    wilayah berikon; foto sampul membulat + keterangan (caption/credit
    media); baris Bagikan di bawah foto.
  - Artikel (acuan infogarut, desktop): isi 20px rata kanan-kiri, spasi
    baris 1,85 (HP tetap 17px rata kiri). Kolom kanan: kartu penulis (nama,
    peran redaksi, profil singkat, tombol berita terbaru) → iklan sidebar →
    "Lainnya di <Kategori>" (penanda kotak merah, 5 berita) → Terpopuler →
    iklan half page; tidak lagi sticky. Kartu penulis di badan artikel dihapus
    (pindah ke kolom kanan).
  - Banner iklan MELAYANG di bawah layar, semua halaman, bisa ditutup (✕).
    Memakai placement FOOTER yang sudah ada (label CMS kini "Banner Melayang
    Bawah"); tanpa kampanye aktif tidak tampil di produksi.
  - Sidebar kiri: blok "Komitmen kami terhadap transparansi" dengan tautan
    Pedoman Media Siber & Syarat & Ketentuan.
  - Beranda: Hero statis 1+2 DIGANTI "Trending Sekarang" — murni foto + judul:
    1 kartu foto besar + 4 kartu foto bernomor #2–#5; tambah "Highlight
    Berita" (carousel geser manual, tanpa auto-play); "Berita Terbaru" menjadi
    list ringkas (thumbnail kiri) dibatasi 8 berita + tombol "Lihat Berita
    Lainnya" ke /terbaru, agar beranda tidak perlu digulir panjang.
    "Jabar Hari Ini" & "Kategori Pilihan" dikeluarkan dari beranda
    (komponennya masih ada di `home-sections.tsx`).
  - Kolom kanan beranda, urutan: "Ikuti Kami" (tile warna per platform,
    data di `siteConfig.social`) → "Statistik Portal" (kartu gelap; angka
    nyata: total artikel dibaca + berita terbit 30 hari) → iklan sidebar;
    sticky di ≥ xl. Most Read & Tag Populer TIDAK lagi di beranda (Most Read
    tetap dipakai halaman lain, judulnya kini "Terpopuler").
  - Footer: charcoal 4 kelompok DIGANTI footer terang selebar layar —
    nama + deskripsi + ikon sosial di kiri, 3 kelompok (Tentang JabarNow!,
    Kerjasama, Legal) di kanan, copyright + kredit pengembang di bawah.
- **Tidak berubah:** palet orange/merah/charcoal, font, posisi iklan mobile
  pertama setelah blok pembuka.
- **Alasan:** Permintaan eksplisit pemilik proyek agar wireframe meniru
  infogarut.id, dengan identitas visual JabarNow! dipertahankan. "Video
  Pilihan" infogarut dilewati (belum ada data video). "Pageviews 30 hari"
  tidak ditampilkan karena belum ada log kunjungan harian.
- **Dokumen terdampak:** `00-MASTER-DESIGN-RULES.md` (header/nav, hero,
  berita terbaru), `02-HOMEPAGE-DESKTOP.md`, `03-HOMEPAGE-MOBILE.md`,
  `04-COMPONENTS-AND-STATES.md` (termasuk aturan footer 4 kelompok).
- **File kode:** `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`,
  `src/components/public/site-sidebar.tsx` (baru), `home-trending.tsx` (baru),
  `highlight-carousel.tsx` (baru), `social-links.tsx` (baru),
  `portal-stats.tsx` (baru), `site-header.tsx`, `site-footer.tsx`,
  `mobile-menu.tsx`, `mobile-bottom-nav.tsx`, `most-read.tsx`,
  `src/lib/navigation.ts`, `src/lib/site-config.ts`, `src/lib/articles.ts`
  (`getPortalStats`), `src/components/common/icons.tsx`,
  `section-heading.tsx`, `sidebar-nav.tsx` (baru), `page-transition.tsx`
  (baru), `src/app/globals.css`, beberapa `page.tsx` publik (ikon judul),
  `breadcrumb.tsx`, `search-overlay.tsx`, `src/app/(public)/artikel/[slug]/page.tsx`,
  `author-card.tsx`, `more-in-category.tsx` (baru), `sticky-ad-frame.tsx` (baru),
  `sticky-bottom-ad.tsx` (baru), `src/app/cms/ads/page.tsx`,
  `src/components/cms/ad-campaign-form.tsx`.

## 2026-10-11 — Breaking ticker: manual → otomatis murni (auto + transisi halus)
- **Perubahan:** Breaking news ticker yang semula WAJIB manual (tanpa gerak
  otomatis) kini berganti otomatis tiap ~4,5 detik dengan transisi fade+slide
  halus. Tombol prev/next manual DIHAPUS (otomatis murni).
- **Alasan:** Permintaan eksplisit pemilik proyek (dua tahap: pertama
  auto-advance, lalu diminta murni otomatis tanpa kontrol manual + lebih halus).
- **Mitigasi (dipertahankan):**
  - Dinonaktifkan animasinya & tetap berganti statis bila pengguna memilih
    `prefers-reduced-motion` (aksesibilitas).
  - `aria-live="polite"` agar pembaca layar mendapat pembaruan yang sopan.
  - Indikator dot (non-interaktif) untuk konteks visual.
- **Dokumen terdampak:** `00-MASTER-DESIGN-RULES.md`, `02-HOMEPAGE-DESKTOP.md`,
  `03-HOMEPAGE-MOBILE.md`, `04-COMPONENTS-AND-STATES.md` (poin "ticker manual"
  tidak lagi berlaku).
- **File kode:** `src/components/public/breaking-ticker.tsx`.
