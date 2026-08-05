# Admin Panel Planı — Masal Yazma Stüdyosu 📝

## 🎯 Hedef
Tarayıcıdan form doldurarak masal eklemek/düzenlemek. Frontmatter formatını bilmene gerek yok — panel senin için `.md` dosyasını oluşturur, slug'ı üretir, tarihi atar. Site yine statik, ücretsiz, güvenli.

## 🏗️ Mimari

**Bağımsız bir Node.js sunucu** (Astro'dan ayrı) — `localhost:4322`'de çalışır. Sadece senin bilgisayarında, internete açık değil.

```
┌─────────────────────────────────────────┐
│  Tarayıcı (http://localhost:4322)        │
│  ┌───────────────────────────────────┐  │
│  │  Masal Yazma Stüdyosu (UI)        │  │
│  │  - Form: başlık, kategori, yaş...  │  │
│  │  - Canlı önizleme (masal kartı)    │  │
│  │  - Mevcut masalları listele/düzenle│  │
│  │  - "Yayınla" butonu                │  │
│  └───────────────────────────────────┘  │
└───────────────────┬─────────────────────┘
                    │ HTTP (lokal)
┌───────────────────▼─────────────────────┐
│  Admin Server (Node.js + Express)        │
│  - POST /api/masal → .md dosyası yazar   │
│  - GET /api/masallar → listeler          │
│  - PUT /api/masal/:slug → düzenler       │
│  - DELETE /api/masal/:slug → siler       │
│  - Frontmatter'ı otomatik üretir        │
└───────────────────┬─────────────────────┘
                    │ dosya yazma
┌───────────────────▼─────────────────────┐
│  src/content/masallar/*.md               │
│  (Astro build bunları okur)              │
└─────────────────────────────────────────┘
```

## 📋 Panel Özellikleri

### 1. Yeni Masal Formu
- **Başlık** (otomatik slug üretir: "Uyku Getiren Yıldız" → `11-uyku-getiren-yildiz`)
- **Kategori** (dropdown: 5 kategori, renkli)
- **Yaş aralığı** (önerilerle: "2-5 yaş", "3-6 yaş", "4-7 yaş")
- **Okuma süresi** (kelime sayısından otomatik tahmin)
- **Kısa açıklama** (SEO için, karakter sayacı: 150-160 hedef)
- **Anahtar kelimeler** (etiket girişi, enter ile eklenir)
- **Masal metni** (büyük editör, kelime sayacı, canlı önizleme)
- **Dersler** (dinamik liste — "Ders ekle" butonu)
- **Tartışma soruları** (dinamik liste)

### 2. Canlı Önizleme
- Yazarken anlık olarak masal kartının nasıl görüneceğini gösterir
- Description karakter sayacı (SEO için 150-160 arası yeşil)
- Kelime sayacı (600-900 hedef gösterimi)

### 3. Masal Yöneticisi
- Tüm masalları listeler (kart halinde)
- Düzenle / Sil butonları
- Tarihe göre sıralama
- Kategoriye göre filtreleme

### 4. Otomatik İşlemler (senin yapman gereken)
- ✅ Slug üretimi (başlıktan)
- ✅ Tarih atama (bugünün tarihi)
- ✅ Frontmatter formatı (doğru YAML)
- ✅ Dosya adı (numaralı sıraya göre)
- ✅ Validation (eksik alan uyarısı)

## 🎨 Teknoloji

- **Backend:** Node.js + Express (sade, tanıdık)
- **Frontend:** Saf HTML/CSS/JS (framework yok — siteyle aynı sıcak tasarım)
- **Dosya işlemi:** Node `fs` (markdown oku/yaz/sil)
- **Bağımlılık:** Sadece `express` (zaten var) — minimal

## 📁 Yeni Dosyalar

```
admin/
├── server.js              # Express sunucu + API
├── public/
│   ├── index.html         # Panel ana sayfası (form + liste)
│   ├── style.css          # Panel stilleri (siteden ayrı)
│   └── app.js             # Form logic, önizleme, API çağrıları
package.json               # "admin" script'i eklenir
```

## 🔄 Kullanım Akışı

```bash
# 1. Paneli başlat
npm run admin
# → "Masal Yazma Stüdyosu: http://localhost:4322"

# 2. Tarayıcıda aç, form doldur, "Yayınla" de

# 3. Siteyi yeniden build et (panel hatırlatır)
npm run build

# 4. Deploy (git push → Cloudflare otomatik)
```

## ✅ Avantajları
- **5 dakika öğrenme süresi** — form doldurmak kadar kolay
- **Hata imkansız** — frontmatter formatını yanlış yazamazsın
- **Görsel** — ne yaptığını görürsün
- **Güvenli** — sadece lokal, internete açık değil
- **Ücretsiz** — sıfır ek maliyet, sıfır API
- **Hızlı** — masal yaz → yayınla, 30 saniye

## ⚠️ Notlar
- Panel Astro build'inden **bağımsız** — site production'da yok, sadece sende
- `admin/` klasörü `.gitignore`'a eklenir (deploy'a gitmez) — OPSIYONEL: istersen git'e ekleriz ki başka bilgisayardan da kullanabilesin
- Mevcut 10 masal panelde görünür ve düzenlenebilir

Onaylarsan hemen kuruyum. Tahmini süre: tek oturumda biter.