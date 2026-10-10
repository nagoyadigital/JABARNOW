# CMS — Users & Roles / Website Settings
Status: **konsep visual awal**.

## Users & Roles
- Daftar user: nama, email, role (8 fixed), status, last login (jika tersedia), created date; pencarian/filter.
- Invite/create user, edit role/status, suspend, reset password dengan verifikasi; konfirmasi aksi berisiko.
- Role names tetap; tidak ada role builder bebas di V1. Permission granular dikelola sesuai kebijakan sistem dan audit.
- Cegah penghapusan/penonaktifan Super Admin terakhir; jangan izinkan escalation privilege.

## Website Settings
- General: nama website, tagline, domain, timezone `Asia/Jakarta`, bahasa Indonesia, kontak redaksi.
- Branding: upload logo utama, favicon terpisah; preview desktop header putih, mobile header, footer charcoal; preserve aspect ratio.
- **Hanya Super Admin** dapat mengubah logo/favicon dan visual tokens; Administrator tidak memiliki override visual.
- Navigasi dan footer: pengelolaan link sesuai struktur yang dikunci, tidak mengubah jumlah kelompok footer desktop tanpa approval.
- Social: tautan akun resmi untuk share dan footer.
- Editorial: workflow preset Simple/Advanced, policy komentar bila fitur komentar disetujui.
- SEO: sitemap/robots/verification fields; ads settings dipisahkan di Ads Manager.
- Semua perubahan settings dicatat, divalidasi, dan dapat dibatalkan bila memungkinkan.
