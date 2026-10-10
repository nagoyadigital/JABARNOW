# Homepage Mobile — JabarNow! V2.1

**Status:** acuan high-fidelity disetujui. Target lebar 390px; seluruh halaman dari header sampai footer.

## Urutan section
1. Header putih: hamburger kiri, area logo resmi tengah, search kanan.
2. Breaking news manual; dapat digeser atau dipilih tanpa gerak otomatis.
3. Hero foto utama dengan overlay judul; tidak ada carousel, indikator dot, maupun panah.
4. Dua headline pendamping setelah hero utama.
5. Slot iklan mobile pertama **setelah seluruh area hero**.
6. Berita Terbaru: list horizontal dengan thumbnail kiri, judul dan metadata kanan.
7. Most Read: tab 24 Jam dan 7 Hari.
8. Jabar Hari Ini: pilihan berita/daerah dalam kartu yang dapat digeser bila diperlukan.
9. Kategori Pilihan: kartu dua kolom jika cukup ruang.
10. Footer gelap dengan empat kelompok tautan yang responsif, sosial, informasi legal dan copyright.
11. Bottom navigation fixed: Beranda, Terbaru, Wilayah, Populer, Menu — selalu terlihat.

## Interaksi
- Bottom nav memperhitungkan safe area perangkat dan padding akhir konten agar tidak menutupi footer.
- Hamburger membuka kategori, wilayah, dan tautan informasi lengkap.
- Search overlay bisa ditutup dengan tombol close, Escape, dan interaksi aksesibel yang sesuai.
- Berita Terpopuler berganti tab tanpa reload penuh.
- Sidebar desktop berubah menjadi section normal pada mobile.
- Tidak ada daftar lengkap 27 kabupaten/kota di homepage; akses melalui menu Wilayah.

## Pengujian
- 360px, 390px, 430px, 768px; tanpa horizontal overflow.
- Header dengan logo tinggi/lebar berbeda tetap rapi tanpa distorsi.
- Judul 2–5 baris, gambar gagal dimuat, tanpa berita, tanpa iklan, jaringan lambat.
- Navigasi fixed tidak menutupi link footer atau aksi penting.
