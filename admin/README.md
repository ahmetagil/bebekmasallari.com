# 🌙 Masal Yazma Stüdyosu — Admin Panel

Tarayıcıdan masal eklemek, düzenlemek ve silmek için lokal panel.
Frontmatter formatını bilmeden, form doldurarak masal yayınlamak.

## 🚀 Başlatma

```bash
npm run admin
```

Sonra tarayıcıda aç: **http://localhost:4322**

Panel açıkken Ctrl+C ile kapatırsın.

## ✨ Özellikler

### Yeni Masal Ekleme
- Form doldur, "Yayınla" de
- **Otomatik slug**: Başlıktan URL üretilir ("Uyku Getiren Yıldız" → `uyku-getiren-yildiz`)
- **Otomatik okuma süresi**: Kelime sayısından hesaplanır
- **Otomatik tarih**: Bugünün tarihi atanır
- **Canlı önizleme**: Slug, karakter/kelime sayacı, SEO durumu
- **Akıllı validation**: Eksik alanları söyler (en az 3 ders, 3 soru, 3 kelime)

### Masal Yönetimi
- **Masallarım** sekmesinden tüm masalları gör
- Kategoriye göre filtrele
- ✏️ **Düzenle**: Her masalı forma yükle, değiştir, kaydet
- 🗑️ **Sil**: Onay penceresiyle güvenli silme

### Siteyi Güncelle
- 🔨 **Siteyi Güncelle** butonu → `npm run build` çalıştırır
- Build başarılı olursa, sadece `git push` yapman yeterli (Cloudflare otomatik deploy eder)

## 📋 Form Alanları Rehberi

| Alan | Zorunlu | İpucu |
|---|---|---|
| **Başlık** | ✅ | Kısa, akılda kalıcı, çocuğun merakını çeksin |
| **Kategori** | ✅ | 5 kategori: Uyku, Arkadaşlık, Cesaret, Sevgi, Öğretici |
| **Yaş aralığı** | ✅ | Öneriler dropdown'da gelir (2-5, 3-6, 4-7 yaş) |
| **Açıklama** | ✅ | SEO için. **150-160 karakter ideal**. Yeşil ✓ görünen kadar yaz |
| **Anahtar kelimeler** | ✅ | Enter ile ekle. Aranabilir Türkçe kelimeler ("uyku masalı") |
| **Masal metni** | ✅ | **600-900 kelime** hedefle. `**kalın**` ve `*italik*` desteklenir |
| **Dersler** | ✅ | En az 3. Ebeveynler için masalın değerini artırır |
| **Tartışma soruları** | ✅ | En az 3. Açık uçlu sorular — çocuk duygularını ifade etsin |

## 🔄 Tam İş Akışı (masaldan yayına)

```bash
# 1. Paneli aç
npm run admin

# 2. Tarayıcıda http://localhost:4322 → form doldur → "Yayınla"

# 3. "Siteyi güncelle?" sorusuna EVET de (otomatik build)

# 4. Git'e push (Cloudflare otomatik canlıya alır)
git add .
git commit -m "Yeni masal: [başlık]"
git push
```

**Toplam süre: ~2 dakika** (masalı yazma hariç)

## 🎨 Tasarım Notları

Panel, siteden **tamamen ayrı** bir tema kullanır:
- Daha fonksiyonel/admin hissi (beyaz kartlar, gri çerçeveler)
- Ama yine sıcak (mor vurgu, krem arka plan)
- Sadece sende çalışır, canlıda görünmez
- Mobil uyumlu (telefondan da masal ekleyebilirsin)

## 🔒 Güvenlik

- Panel **sadece `127.0.0.1`'de** dinler — internete açık değil
- Başka bilgisayardan erişilemez
- Şifre yok (gerek yok — sadece senin makinen)

## 🛠️ Teknik

- **Sıfır bağımlılık** — Node'un yerleşik `http` ve `fs` modülleriyle yazıldı
- `admin/` klasörü `.gitignore`'da **yorum satırı** (istersen git'e ekleyip başka bilgisayardan da kullanabilirsin — `.gitignore`'dan `# admin/` satırını aç)

## ❓ Sorun Giderme

**"Port 4322 kullanımda" hatası**
```bash
# Node süreçlerini kapat (Windows)
taskkill /F /IM node.exe
# Tekrar dene
npm run admin
```

**Masal yayınlandı ama sitede görünmüyor**
- "Siteyi Güncelle" butonuna basmadıysan build alınmamıştır
- Veya `npm run build` manuel çalıştır

**Yanlışlıkla masal sildim**
- Git ile geri alabilirsin: `git checkout -- src/content/masallar/`
- Ama silmeden önce her zaman onay penceresi gelir

## 📁 Dosya Yapısı

```
admin/
├── server.js              # Sunucu + API (Node.js)
├── README.md              # Bu dosya
└── public/
    ├── index.html         # Panel arayüzü
    ├── style.css          # Panel stilleri
    └── app.js             # Form logic, canlı önizleme
```

---

🌙 İyi masallar!
