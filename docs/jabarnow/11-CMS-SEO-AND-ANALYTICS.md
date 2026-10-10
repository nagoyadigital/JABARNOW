# CMS — SEO Manager & Analytics
Status: **konsep visual awal**, integrasi eksternal belum diklaim aktif.

## SEO Manager
- Dashboard SEO issues yang benar-benar terdeteksi, metadata artikel/kategori/wilayah/author, canonical, robots/noindex, XML sitemap, schema `NewsArticle`, Open Graph/Twitter metadata, redirect 301/302, preview snippet.
- Slug collision detection, broken links jika crawler tersedia, status sitemap generation dan schema validation berdasar tes aktual.
- GSC/GA4 **integration-ready**, bukan wajib live sejak peluncuran. OAuth/credential harus disimpan aman, bukan ditulis ke dokumen atau repo.
- 'Indexed URLs' dan impressions Google tidak boleh diisi angka dummy dan diklaim data nyata.

## Analytics
- Filter rentang waktu WIB, pageviews, visitors bila dapat dihitung, traffic sources, top articles, author performance, kategori/wilayah performance.
- Bedakan internal analytics, GA4, dan GSC; beri label sumber dan refresh time.
- Jika belum terintegrasi, tampilkan onboarding/empty state, bukan metrik palsu.
- Tabel dapat difilter, disortir, dan diekspor jika diimplementasikan serta disetujui.
- Privacy-first: hindari menampilkan PII pengunjung; batasi akses berdasarkan role.
