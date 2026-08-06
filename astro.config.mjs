import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Canlı domain — sitemap ve canonical URL'ler için kritik.
  // Cloudflare'e bağladığında bu adres geçerli olacak.
  site: 'https://bebekmasallari.com',
  integrations: [
    sitemap({
      // Yasal sayfalar / arama olmayan her şey sitemap'e girer
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  // Statik çıktı = en hızlı SEO performansı
  output: 'static',
  // Tüm URL'ler eğik çizgili olsun (/kategori/uyku/) — SEO tutarlılığı için.
  // 308 redirect'leri önler, analiz araçları "tutarlı" der.
  trailingSlash: 'always',
  build: {
    // /masallar/uyku-getiren-yildiz/index.html → temiz URL'ler
    format: 'directory',
  },
  compressHTML: true,
});
