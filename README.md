# bebekmasallari.com 🌙

Çocuklar için özgün uyku, arkadaşlık, cesaret, sevgi ve öğretici masallar.
Astro ile geliştirildi, SEO için optimize edildi, AdSense onayına hazır.

## ✨ Özellikler

- **10 adet tamamen özgün masal** — her biri 600-900 kelime
- **5 kategori** — Uyku, Arkadaşlık, Cesaret, Sevgi, Öğretici
- **Ebeveyn rehberi** — her masalda dersler + tartışma soruları (AdSense için kritik)
- **Güçlü SEO** — JSON-LD (Article + Breadcrumb + WebSite), sitemap, canonical, Open Graph
- **Sıcak, mobil uyumlu tasarım** — krem/lavanta/mint paleti
- **Yasal sayfalar** — Gizlilik (KVKK/GDPR), Yasal Uyarı (affiliate), İletişim, Hakkımızda
- **Affiliate altyapısı** — Amazon Associates için hazır (link ekleyince otomatik)
- **0₺ hosting** — Cloudflare Pages ile tamamen ücretsiz

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu (http://localhost:4321)
npm run dev

# Production build
npm run build

# Build'i lokal olarak önizle
npm run preview
```

## 📁 Proje Yapısı

```
src/
├── config.ts                 # Site bilgileri, kategoriler, navigasyon
├── content/
│   ├── config.ts             # Masal şeması (Zod validation)
│   └── masallar/             # 10 masal (.md)
├── layouts/
│   ├── Base.astro            # Tüm sayfaların iskeleti
│   └── Masal.astro           # Masal detay sayfası layout'u
├── components/
│   ├── Seo.astro             # Meta etiketleri + Open Graph
│   ├── JsonLd.astro          # Schema.org yapılandırılmış veri
│   ├── Header.astro / Footer.astro
│   ├── MasalKart.astro       # Listeleme kartı
│   ├── EbeveynRehberi.astro  # AdSense için kritik bölüm
│   └── AffiliateOneri.astro  # Kitap/oyuncak önerileri
├── pages/
│   ├── index.astro           # Anasayfa
│   ├── masallar/[slug].astro # Masal sayfaları (dinamik)
│   ├── kategori/[kategori].astro
│   └── hakkinda / iletisim / gizlilik-politikasi / yasal-uyari.astro
└── styles/global.css
```

## ✍️ Yeni Masal Ekleme

`src/content/masallar/` klasörüne yeni bir `.md` dosyası ekle:

```markdown
---
title: "Masal Başlığınız"
description: "150-160 karakter arası, aranabilir kelimeler içeren SEO açıklaması."
pubDate: 2026-03-10
kategori: "uyku-masallari"   # uyku | arkadaslik | cesaret | sevgi | ogretici
yasAraligi: "3-6 yaş"
okumaSuresi: 4
dersler:
  - "Ders 1"
  - "Ders 2"
  - "Ders 3"
  - "Ders 4"
tartismaSorulari:
  - "Soru 1"
  - "Soru 2"
  - "Soru 3"
  - "Soru 4"
keywords:
  - "anahtar kelime 1"
  - "anahtar kelime 2"
author: "bebekmasallari.com"
---

Bir varmış, bir yokmuş... [masal metni]
```

Build sırasında otomatik olarak anasayfada, kategori sayfasında ve sitemap'te görünür.

## 🌐 Yayına Alma (Cloudflare Pages — Ücretsiz)

### 1. GitHub'a yükle
```bash
git init
git add .
git commit -m "İlk yayım: bebekmasallari.com"
# GitHub'da repo oluştur, sonra:
git remote add origin https://github.com/KULLANICI/bebekmasallari.com.git
git branch -M main
git push -u origin main
```

### 2. Cloudflare Pages'e bağlan
1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create
2. **Connect to Git** → GitHub repo'nu seç
3. Build ayarları:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 22 (Settings → Environment)
4. **Save and Deploy**

### 3. Domain'i bağla
1. Cloudflare Pages → projen → **Custom domains** → **Set up a domain**
2. `bebekmasallari.com` gir (alan adı Cloudflare'de yönetiliyorsa otomatik DNS)
3. `www.bebekmasallari.com` için de ekle (301 yönlendirmesi otomatik)
4. SSL sertifikası otomatik gelir (birkaç dakika)

### 4. Site URL'ini güncelle
`astro.config.mjs` içindeki `site` alanı zaten `https://bebekmasallari.com` olarak ayarlı. Farklı bir domain kullanırsan bunu güncelle (sitemap ve canonical için kritik).

## 📊 Google'a Tanıtma

### Google Search Console
1. [search.google.com/search-console](https://search.google.com/search-console)
2. Property ekle → `bebekmasallari.com` (Domain türü, tüm varyantlar için)
3. Domain sağlayıcında DNS TXT kaydı ile doğrula
4. **Sitemaps** → `https://bebekmasallari.com/sitemap-index.xml` gönder
5. 2-4 gün içinde sayfalar indekslenmeye başlar

### Bing Webmaster Tools
1. [bing.com/webmasters](https://www.bing.com/webmasters)
2. Site ekle, Search Console'dan içe aktar seçeneği var
3. Sitemap gönder

## 💰 Gelir (AdSense + Affiliate)

### Google AdSense
Site canlı olduktan sonra:
1. 20+ masal olunca (şu an 10'dayız) başvur
2. [adsense.google.com](https://adsense.google.com) → Başvur
3. Onay sonrası reklam kodu ekle (reklam yerleşimi bileşeni eklenecek)
4. Onay genelde 1-4 hafta

**AdSense için hazır olduğumuz şeyler:**
- ✅ Yasal sayfalar (Gizlilik, Yasal Uyarı, İletişim, Hakkımızda)
- ✅ Özgün içerik (kopya değil)
- ✅ Ebeveyn rehberi (saf kurgu değil, değerli içerik)
- ✅ Temiz navigasyon, mobil uyumlu
- ✅ Hızlı yükleme (statik site)

### Amazon Associates (Affiliate)
1. [affiliate-program.amazon.com.tr](https://affiliate-program.amazon.com.tr) → Başvur
2. Onay alınca her masaldaki `AffiliateOneri.astro` bileşenine link ekle
3. `src/components/AffiliateOneri.astro` dosyasındaki yorum satırlarını takip et

## 🎯 SEO Kontrol Listesi (Yayın Sonrası)

- [ ] Google Search Console'da sitemap gönderildi
- [ ] İndeksleme durumu kontrol ediliyor (3-7 gün)
- [ ] Her masal için sosyal medya paylaşımı (Pinterest, Instagram)
- [ ] Haftalık 1-2 yeni masal ekleme (tutarlılık = SEO)
- [ ] Lighthouse testi (Performans, SEO, Erişilebilirlik 90+ olmalı)

## 📝 İçerik Stratejisi (İlk 6 Ay)

- **İlk ay:** Haftada 2 masal → 18 masal
- **2-6. ay:** Haftada 1 masal → ~40 masal
- **Her masal:** Pinterest'te 3 pin, Instagram'da 1 story
- **Uzun kuyruklu SEO:** "3 yaş uyku masalı", "kısa cesaret masalı" gibi

## 🛠️ Teknik Notlar

- **Astro 4** + `@astrojs/sitemap` 3.2.1 (sürüm önemli — daha yenisi Astro 4 ile uyumsuz)
- Statik çıktı (`output: 'static'`) → en hızlı SEO
- Sıfır gereksiz JS → sadece mobil menü toggle'ı (1.5KB)
- Sistem fontları → ek font yükleme yok
- Markdown içerik → kolay düzenleme, sürüm kontrolü

## 📞 Sorular?

`src/config.ts` tek bilgi kaynağı — site adı, e-posta, kategoriler oradan değişir.

---

🌙 Sıcacık masal dolu akşamlar!
