# Homepage Desktop — JabarNow! V2.0

**Status:** acuan high-fidelity disetujui. Target artboard 1440px, full-page hingga footer.

## Urutan section
1. Topbar: tanggal WIB, tautan Tentang, Redaksi, Kontak dan sosial.
2. Header putih: area logo asli di kiri; leaderboard iklan di kanan jika aktif. Tidak menambah panel charcoal khusus logo.
3. Navbar charcoal: kategori utama, menu Wilayah, pencarian; saat scroll hanya navbar compact sticky, bukan topbar dan iklan.
4. Breaking news: label merah/orange, navigasi ticker **manual**, bukan marquee otomatis.
5. Hero: 1 kartu foto besar dengan headline putih overlay dan gradient gelap; 2 pendamping bertumpuk, hero statis tanpa dot/panah.
6. Berita Terbaru: kombinasi grid kartu bergambar dan list horizontal, dengan judul, kategori, penulis/tanggal sesuai kebutuhan.
7. Sidebar: Most Read 24 Jam / 7 Hari (hanya dua tab); smart sticky berhenti sebelum footer. Slot iklan sidebar bila aktif.
8. Iklan in-feed horizontal di antara blok konten, sesuai penempatan manual.
9. Jabar Hari Ini: ringkasan berita dari beberapa wilayah terpilih; **bukan** daftar lengkap 27 wilayah.
10. Kategori Pilihan: kartu kategori dengan tautan ke arsip kategori.
11. Footer gelap: empat kelompok Tentang Kami, Kategori, Wilayah, Informasi; logo resmi, deskripsi, sosial, copyright, legal.

## Perilaku dan batasan
- Tidak ada section direktori panjang 'Jelajahi 27 Kabupaten/Kota' pada homepage.
- Halaman direktori Wilayah tetap dapat diakses dari navbar dan footer.
- Gambar card menggunakan `cover` dengan focal point dari CMS.
- Judul panjang harus tertangani tanpa memotong konten penting secara permanen.
- Iklan adalah contoh penempatan; mockup tidak menyatakan sponsor/kerja sama aktual.
- Iklan nonaktif tidak menyisakan blok kosong besar; iklan aktif menghindari layout shift dengan ukuran slot yang direncanakan.
- Search membuka overlay dan menuju halaman hasil pencarian.
- Skeleton ditampilkan saat loading data yang nyata.
