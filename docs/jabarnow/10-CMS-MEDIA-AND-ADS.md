# CMS — Media Library & Ads Manager
Status: **konsep visual awal**, wajib review sebelum design freeze.

## Media Library
- Grid/list view; filter image/video/document, search filename/alt/caption, sort newest/oldest/size.
- Upload drag/drop dan file picker, progress per file, thumbnail, metadata (title, alt, caption, credit, MIME, dimensions, size, upload owner/date), replace jika aman, penggunaan aset dalam artikel.
- Validasi MIME nyata, size limits configurable, filename sanitization, file scan bila tersedia, storage authorization, responsive thumbnails, crop/focal point; hapus aset dengan referensi aktif harus diperingatkan.
- Empty/error/loading states dan pagination.

## Ads Manager (terkunci)
- Manual placement + campaign scheduling; format image/banner, HTML, third-party script yang disetujui.
- Daftar placement: header leaderboard, sidebar, in-feed, after-cover/in-article di halaman artikel, footer bila sesuai desain; aktif hanya di lokasi yang disetujui.
- Fields: campaign name, creative type, placement, destination URL (untuk banner), active status, start/end WIB, preview desktop/mobile, tracking jika tersedia.
- Script pihak ketiga dibatasi role, preview terisolasi, CSP/sandbox sesuai kemampuan stack, audit perubahan; hindari injeksi script ke CMS.
- Slot reserve height untuk mencegah CLS; nonaktif tidak menyisakan area kosong besar; tidak autoplay audio, tidak menutupi konten.
- **Tidak termasuk** rotasi otomatis, geo-targeting, device-targeting sebagai engine kampanye, atau popup agresif tanpa keputusan tambahan.
- Statistik impressions/clicks hanya jika benar-benar dikumpulkan; label sumber metrik.
