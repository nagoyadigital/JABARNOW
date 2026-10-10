# CMS — Tulis Artikel / Visual Block Editor
Status: **Arah visual desktop disetujui**, detail fungsional berikut adalah spesifikasi kerja yang perlu diuji.

## Layout desktop
- Shell CMS konsisten; breadcrumb, judul 'Tulis Artikel', status autosave, Preview, Simpan Draft, Kirim Review/Publish sesuai izin.
- Area menulis paling luas di kiri; panel metadata dan publishing di kanan. Jika ruang terbatas, panel kanan menjadi tab/drawer.
- Field judul, slug otomatis dan editable dengan validasi unik, excerpt, featured image, caption, kredit foto, alt text, kategori, wilayah, tag, metadata SEO.
- Editor blok: paragraph, H2/H3, bold/italic, link, quote, list, image, table, embed. Paste harus disanitasi; HTML berbahaya tidak boleh lolos.
- Autosave dengan status: menyimpan/tersimpan/gagal, perlindungan perubahan belum disimpan, pemulihan draft bila memungkinkan.
- Preview desktop/mobile sesuai rendering frontend; validasi sebelum submit.

## Validasi editorial
- Panjang artikel 400–500 kata adalah target editorial yang dapat diperingatkan, **bukan alasan menghapus tulisan pengguna**.
- Judul natural, kategori/wilayah relevan, sumber/kredit foto benar, tanggal WIB; SEO title/description, canonical, OG image, focus keyword.
- Internal link rekomendasi boleh menjadi checklist, bukan penyisipan otomatis tanpa persetujuan redaksi.
- Status: Draft → Submitted → Revision Requested/Approved → Scheduled/Published; Archive dan riwayat revisi.
- Jangan menampilkan tombol Publish bagi role tanpa permission; semua aksi diverifikasi server-side.

## Media
- Featured image: aspect ratio crop cover, focal point yang bisa disesuaikan; preview, replace, remove, attribution.
- Media dalam artikel disimpan sebagai referensi aset; caption tidak boleh mengarang 'Foto: AI' bila bukan gambar AI.

## Mobile CMS
- Judul dan editor satu kolom, toolbar dapat discroll, metadata sebagai accordion/drawer; sticky action bar tidak menutupi teks atau keyboard.
- Upload, edit, autosave, preview, submit review, publish sesuai izin tetap tersedia.
