# Changelog — Perubahan Design Lock

Dokumen ini mencatat perubahan terhadap keputusan desain yang dikunci
(lihat `00-MASTER-DESIGN-RULES.md`). Setiap entri = override yang disetujui
pemilik proyek.

## 2026-10-11 — Breaking ticker: manual → otomatis (auto-advance)
- **Perubahan:** Breaking news ticker yang semula WAJIB manual (tanpa gerak
  otomatis) kini berganti otomatis tiap ~5 detik (auto-advance).
- **Alasan:** Permintaan eksplisit pemilik proyek.
- **Mitigasi (dipertahankan):**
  - Tombol prev/next manual tetap ada.
  - Auto-advance berhenti saat hover/fokus (pause-on-interaction).
  - Dinonaktifkan otomatis bila pengguna memilih `prefers-reduced-motion`
    (aksesibilitas).
  - `aria-live="polite"` agar pembaca layar mendapat pembaruan yang sopan.
- **Dokumen terdampak:** `00-MASTER-DESIGN-RULES.md`, `02-HOMEPAGE-DESKTOP.md`,
  `03-HOMEPAGE-MOBILE.md`, `04-COMPONENTS-AND-STATES.md` (poin "ticker manual"
  kini tidak berlaku untuk perilaku auto-advance).
- **File kode:** `src/components/public/breaking-ticker.tsx`.
