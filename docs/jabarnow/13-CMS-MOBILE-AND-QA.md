# CMS Mobile UX & QA
Status: spesifikasi responsif; **belum ada high-fidelity CMS mobile yang disetujui**.

## UX
- Target viewport 390px; uji 360, 430, 768, 1024, 1440.
- Sidebar menjadi drawer, topbar ringkas, global search tetap tersedia, KPI 2 kolom atau 1 kolom sesuai ruang.
- Tabel desktop menjadi stacked cards dengan aksi dalam overflow menu; filter lewat drawer/sheet; jangan paksa scroll horizontal untuk aksi kritis.
- Editor mobile mendukung penulisan penuh, upload, metadata, SEO, draft, review, publish sesuai izin.
- Sticky actions hormati safe area dan virtual keyboard; focus, touch target minimal sekitar 44px, label jelas.

## State wajib
Loading skeleton, empty state, offline/network error, save conflict, permission denied, upload failed, confirm delete/reject/publish, success toast, expired session.

## QA
- Akses keyboard/focus, kontras WCAG AA, screen reader labels, reduced motion.
- Test ownership/permissions API, cross-role escalation, publish flow Simple/Advanced, XSS via editor and ads, file upload MIME validation, secure password reset.
- Layout screenshot diff terhadap mockup approved untuk homepage dan CMS yang sudah approved.
- Data dashboard harus akurat dan berlabel periode/timezone; jangan hardcode dummy stats di production.
