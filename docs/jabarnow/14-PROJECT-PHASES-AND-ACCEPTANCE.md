# Project Milestones & Acceptance Criteria

## Tahap 0 — Audit & approval (wajib sebelum coding)
- Identifikasi repo/stack/deployment atau usulkan stack jika proyek baru.
- Gap analysis vs specs, risiko keamanan, data model, integrasi, rencana pengujian.
- Presentasikan proposal dan tunggu persetujuan pemilik.

## Tahap 1 — Design foundation
- Tokens terkunci, komponen dasar, typography, shell public/CMS, upload placeholder logo.
- Uji responsive dan accessibility baseline.

## Tahap 2 — Public homepage
- Desktop 1440px sesuai V2.0; mobile 390px sesuai V2.1; hero statis 1+2, ticker manual, search overlay, latest mixed, Most Read 24 jam/7 hari, kategori, Jabar Hari Ini, ads moderate, footer charcoal 4 kelompok.
- **Tidak ada daftar Jelajahi 27 Kabupaten/Kota di homepage**; navigasi wilayah menuju halaman khusus.
- Mobile ad pertama setelah seluruh hero; bottom nav selalu terlihat dan tidak menutup konten.

## Tahap 3 — CMS foundation
- Auth standar aman, 8 role fixed, granular permission server-side, audit log, sidebar/topbar/dashboard.

## Tahap 4 — Editorial
- Artikel, block editor, media, revision history, Simple/Advanced workflow, review queue, scheduling WIB.

## Tahap 5 — SEO, Ads, Analytics
- SEO internal advanced dan integration-ready; Ads manual placement/scheduling; analytics berdasarkan data aktual.

## Tahap 6 — Remaining pages & mobile CMS
- Detail artikel, kategori, wilayah 27 kota/kabupaten, author, search, about/redaksi/legal; high-fidelity untuk halaman tersebut harus disetujui sebelum design freeze.
- CMS full-featured mobile, QA keamanan/performa/aksesibilitas.

## Definition of Done tiap tahap
1. Fitur bekerja sesuai permission dan acceptance criteria.
2. Screenshot desktop/mobile ditinjau pemilik; tidak ada design drift.
3. Loading/error/empty state dan validasi form.
4. Tests yang relevan lulus; tidak ada kredensial hardcoded.
5. Changelog dan daftar hal yang masih pending.

## Catatan status desain
- Approved visual: Homepage Desktop V2.0, Homepage Mobile V2.1, CMS Overview, CMS Article Editor.
- Draft visual: CMS Review & Approval.
- Concept-only: Media, Ads, SEO, Analytics, Users & Roles, Settings; perlu review per layar.
- Pending design: detail artikel, kategori, wilayah, author, search, legal, CMS mobile.
