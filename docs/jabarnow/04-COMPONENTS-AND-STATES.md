# Komponen dan State — JabarNow! V2.1

## Komponen publik
- BrandLogo: sumber dari upload manual CMS, menjaga rasio asli; lokasi header dan footer.
- HeaderDesktop / HeaderMobile / CompactNavbar / MobileBottomNav.
- BreakingTickerManual: next/previous atau swipe; keadaan kosong menyembunyikan modul.
- HeroOverlayCard: gambar cover, focal point, gradient, kategori, judul, metadata.
- SecondaryHeroCard, StandardNewsCard, HorizontalNewsRow, MostReadRankRow.
- SectionHeading: judul, aksen brand, tautan Lihat Semua bila tersedia.
- MostReadTabs: hanya `24 Jam` dan `7 Hari`; data berdasar rentang waktu nyata.
- AdSlot: aktif/nonaktif, responsif, label iklan yang sesuai.
- Footer4Groups: responsif, memuat tautan editorial dan legal.
- SearchOverlay, RegionMenu, CategoryMenu.

## State wajib
- Default, hover, focus-visible, active, disabled.
- Loading skeleton, empty, error, fallback gambar.
- Search: terbuka, mengetik, hasil, tanpa hasil.
- Most Read: loading/terisi/kosong per tab.
- AdSlot: tersedia/terjadwal/nonaktif/gagal dimuat.
- Navbar: normal/sticky; drawer mobile tertutup/terbuka.

## Aksesibilitas dan performa
- Fokus keyboard terlihat, tombol memiliki nama aksesibel, modal mengelola fokus.
- Gunakan alt text editorial yang relevan dan fallback saat gambar gagal.
- Hindari animasi otomatis yang mengganggu; hormati prefers-reduced-motion.
- Prioritaskan gambar hero untuk loading, lazy-load gambar jauh di bawah viewport.
- Uji Core Web Vitals (LCP, CLS, INP) pada implementasi, bukan dari mockup.
