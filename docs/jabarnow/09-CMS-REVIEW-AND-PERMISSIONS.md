# CMS — Review, Editorial Workflow & Permissions
Status: **Review desktop konsep awal selesai**, belum dinyatakan final pixel-perfect.

## Preset workflow (terkunci)
- Simple: Contributor/Reporter menulis → Editor meninjau → publish oleh role berizin.
- Advanced: Reporter → Editor approval → Pemimpin Redaksi approval → publish oleh role berizin.
- Administrator dapat memilih preset bila punya izin; tidak ada workflow builder bebas.
- Revision Requested kembali ke penulis dengan catatan; Rejected memerlukan alasan dan konfirmasi; Approved tidak selalu berarti Published.
- Published edit menggunakan version history dan audit trail; scheduled mengikuti WIB.

## UI Review
- Panel kiri: daftar artikel, status tabs (Menunggu Review, Perlu Revisi, Disetujui, Terjadwal, Published, Ditolak), pencarian, filter kategori/wilayah/penulis/tanggal.
- Panel utama: preview artikel, foto, byline, kategori, isi, tab konten/SEO/detail/riwayat.
- Panel tindakan: status, komentar editor, checklist editorial, approval/revision/rejection, schedule sesuai izin.
- Tombol dan status tidak boleh bertentangan; semua perubahan status memiliki konfirmasi, loading, error, audit.

## Delapan role tetap
| Role | Cakupan utama |
|---|---|
| Super Admin | Seluruh sistem, branding, konfigurasi keamanan, permission |
| Administrator | Operasional, user management sesuai delegasi, kategori/wilayah, preset workflow |
| Pemimpin Redaksi | Final editorial approval dan publish sesuai preset |
| Editor | Review, revision, approval, publish hanya jika diberikan izin |
| Reporter | Create/edit own drafts, submit, perbaiki revisi |
| Contributor | Create own drafts dan submit; tidak publish |
| Ads Manager | Kelola ads/campaign/reporting; tidak publish berita |
| SEO Manager | Metadata, audit, redirect, sitemap; tidak mengubah role/security |

Permission granular yang disarankan: `article.create`, `article.edit_own`, `article.edit_any`, `article.submit`, `article.review`, `article.approve`, `article.publish`, `article.schedule`, `article.delete`, `media.manage`, `ads.manage`, `seo.manage`, `analytics.view`, `users.manage`, `settings.manage`, `design.manage`. **`design.manage` hanya Super Admin.** Tentukan matriks detail saat arsitektur disetujui.

## Keamanan
- Email/password standar sesuai keputusan; hash password kuat, rate limit login, secure session/cookies, CSRF protection bila relevan, reset password aman, audit log. 2FA tidak diwajibkan dalam V1.
- Jangan bocorkan draft ke publik atau API tanpa izin.
