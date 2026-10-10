# Changelog — Perubahan Design Lock

Dokumen ini mencatat perubahan terhadap keputusan desain yang dikunci
(lihat `00-MASTER-DESIGN-RULES.md`). Setiap entri = override yang disetujui
pemilik proyek.

## 2026-10-11 — Breaking ticker: manual → otomatis murni (auto + transisi halus)
- **Perubahan:** Breaking news ticker yang semula WAJIB manual (tanpa gerak
  otomatis) kini berganti otomatis tiap ~4,5 detik dengan transisi fade+slide
  halus. Tombol prev/next manual DIHAPUS (otomatis murni).
- **Alasan:** Permintaan eksplisit pemilik proyek (dua tahap: pertama
  auto-advance, lalu diminta murni otomatis tanpa kontrol manual + lebih halus).
- **Mitigasi (dipertahankan):**
  - Dinonaktifkan animasinya & tetap berganti statis bila pengguna memilih
    `prefers-reduced-motion` (aksesibilitas).
  - `aria-live="polite"` agar pembaca layar mendapat pembaruan yang sopan.
  - Indikator dot (non-interaktif) untuk konteks visual.
- **Dokumen terdampak:** `00-MASTER-DESIGN-RULES.md`, `02-HOMEPAGE-DESKTOP.md`,
  `03-HOMEPAGE-MOBILE.md`, `04-COMPONENTS-AND-STATES.md` (poin "ticker manual"
  tidak lagi berlaku).
- **File kode:** `src/components/public/breaking-ticker.tsx`.
