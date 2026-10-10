# CMS Information Architecture & Dashboard Overview
Status: **Overview desktop disetujui sebagai arah visual**; belum pixel-perfect. Desktop target 1440px; mobile full-featured.

## Shell aplikasi
- Sidebar kiri charcoal `#17191D`, baseline 248px, collapsible; active menu orange `#F4511E`; menu disembunyikan jika permission tidak cukup.
- Topbar terang: global search (artikel/penulis/kategori), notifikasi dashboard, tautan lihat website, avatar dan menu akun.
- Workspace latar `#F7F8FA`; cards putih, border `#E5E7EB`, radius 10px, spacing konsisten; teks UI Inter.
- Logo area CMS menggunakan upload logo resmi; jangan recreate dari gambar mockup.

## Navigation map
- Overview
- Konten: Artikel, Tulis Artikel, Review & Persetujuan, Media Library, Kategori, Wilayah, Tag, Komentar (jika fitur komentar disetujui)
- Monetisasi: Ads Manager (jangan gandakan menu iklan tanpa alasan)
- SEO & Analytics: SEO Manager, Analytics, Laporan bila diperlukan
- Manajemen: Users & Roles, Website Settings, Notifikasi, Audit Log
- Visibilitas item dan aksi mengikuti izin; 8 role tetap.

## Overview sections
1. Sapaan personal dan tanggal WIB; banner dekoratif opsional dan tidak boleh mengurangi keterbacaan.
2. KPI: total artikel, published, draft, menunggu review, scheduled; setiap angka dihitung berdasarkan hak akses pengguna.
3. Quick actions: Tulis Artikel, Upload Media, Lihat Jadwal, Lihat Website (hanya jika diizinkan).
4. Analytics: grafik traffic berdasarkan rentang waktu, total visitors, pageviews, engagement metrics **hanya jika benar-benar tersedia**; data kosong tampil sebagai empty state.
5. Sumber traffic: organic/direct/social/referral/other jika provider data mendukung.
6. Artikel terbaru: judul, thumbnail, kategori, penulis, status, tanggal WIB, views bila tersedia, tindakan.
7. Review queue: antrean relevan dengan role, status, penulis, waktu pengajuan, tautan detail.
8. Artikel terjadwal, aktivitas redaksi, performa penulis, status sistem berdasarkan sumber data nyata.

## Aturan data
- Jangan hardcode angka ilustrasi pada production.
- Semua statistik punya definisi periode dan zona waktu; waktu editorial Asia/Jakarta (WIB).
- Tampilkan loading skeleton, error/retry, empty state, dan akses terbatas.
- Jangan membuat klaim 'database online', 'backup normal', atau 'SEO indexed' tanpa pemeriksaan aktual.
