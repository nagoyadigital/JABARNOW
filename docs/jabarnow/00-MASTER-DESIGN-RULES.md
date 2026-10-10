# JabarNow! — Master Design Rules V2.1

Status: Homepage Desktop V2.0 dan Mobile V2.1 disetujui sebagai acuan visual. Dokumen ini adalah spesifikasi desain, **bukan kode implementasi**.

## Sumber kebenaran
1. Keputusan desain yang disetujui dalam diskusi V1.1–V2.1.
2. Mockup homepage desktop V2.0 dan mobile V2.1 sebagai referensi komposisi, **bukan sumber nilai piksel yang sudah terukur**.
3. Aset logo/favikon resmi diunggah manual oleh Super Admin pada saat implementasi; mockup tidak boleh dijadikan sumber untuk mengekstrak logo.
4. Token di `01-DESIGN-TOKENS.md` untuk implementasi konsisten.

## Aturan terkunci
- Identitas: JabarNow!, gaya Hybrid Modern News.
- Palet orange/merah/charcoal/putih; font Plus Jakarta Sans untuk judul, Inter untuk body dan UI.
- Header putih, navigasi charcoal compact sticky; logo asli tanpa rekonstruksi.
- Hero statis: 1 berita utama overlay foto + 2 berita pendamping; tanpa slider otomatis, dot atau panah.
- Berita terbaru mixed grid/list desktop dan list horizontal mobile.
- Most Read hanya 24 Jam dan 7 Hari.
- Iklan moderate, manual placement + penjadwalan, gambar/HTML/script yang disetujui.
- Mobile: iklan pertama setelah seluruh blok hero; bottom navigation selalu terlihat.
- Footer charcoal: 4 kelompok tautan desktop, tersusun responsif di mobile.
- Tidak menampilkan direktori 27 kabupaten/kota di homepage. Akses seluruh wilayah tetap melalui navigasi/halaman khusus.
- Hak mengubah identitas visual hanya Super Admin.

## Kendali perubahan
Setiap perubahan pada logo, palet, font, hero, struktur homepage, navigasi, footer, atau ukuran token wajib mendapat persetujuan Super Admin dan dicatat dalam changelog. Konten editorial, judul, gambar berita, dan materi iklan merupakan data dinamis, bukan perubahan desain.

## Status desain
- Homepage desktop: disetujui sebagai referensi visual, belum diverifikasi pixel-perfect.
- Homepage mobile: disetujui sebagai referensi visual, belum diverifikasi pixel-perfect.
- Detail Artikel, Kategori, Wilayah, Author, Search, halaman informasi, dan CMS: belum memiliki high-fidelity final.
- Tidak ada situs atau kode yang dibuat dalam paket dokumentasi ini.
