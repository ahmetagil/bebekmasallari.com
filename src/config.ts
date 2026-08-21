// ============================================================
// Site geneli tek bilgi kaynağı (single source of truth).
// Header, footer, SEO default'ları ve kategori metadata buradan gelir.
// ============================================================

export const SITE = {
  name: 'bebekmasallari.com',
  title: 'Bebek Masalları',
  tagline: 'Çocuğunuzun uykusuna eşlik eden sıcacık masallar',
  description:
    'Bebek ve çocuklar için özgün uyku, arkadaşlık, cesaret ve sevgi masalları. Her masalda ebeveyn rehberi: dersler ve tartışma soruları.',
  url: 'https://bebekmasallari.com',
  locale: 'tr_TR',
  language: 'tr',
  // Sosyal paylaşımda default görsel
  defaultOgImage: '/og-default.png',
  // E-posta (iletişim sayfası ve JSON-LD için)
  email: 'merhaba@bebekmasallari.com',
  author: 'bebekmasallari.com',
  foundedYear: 2026,
  // AdSense yayıncı ID'si (alıcının hesabı).
  // Boş bırakılırsa AdSense script'i hiç yüklenmez.
  // Değişirse sadece bu satırı güncelle.
  adsenseClient: 'ca-pub-2917605569005680',
} as const;

// Kategoriler — tek yerde tanımlı, her yerde kullanılır.
// slug → insan-okur isim + kısa açıklama + renk + emoji
export const KATEGORILER = {
  'uyku-masallari': {
    isim: 'Uyku Masalları',
    aciklama: 'Çocuğunuzun yavaş yavaş uykuya dalmasına yardımcı olan, sakinleştirici masallar.',
    renk: 'var(--mavi-saks)',
    renkAcik: '#d8e4ed',
    emoji: '🌙',
  },
  'arkadaslik-masallari': {
    isim: 'Arkadaşlık Masalları',
    aciklama: 'Paylaşma, hoşgörü ve dostluk üzerine sıcak hikâyeler.',
    renk: 'var(--mint)',
    renkAcik: 'var(--mint-acik)',
    emoji: '🤝',
  },
  'cesaret-masallari': {
    isim: 'Cesaret Masalları',
    aciklama: 'Korkularıyla yüzleşen, cesur küçük kahramanların hikâyeleri.',
    renk: 'var(--seftali)',
    renkAcik: '#fce5d6',
    emoji: '🦁',
  },
  'sevgi-masallari': {
    isim: 'Sevgi Masalları',
    aciklama: 'Aile, sevgi ve bağlılık üzerine kalbi ısıtan masallar.',
    renk: 'var(--gul)',
    renkAcik: '#f8dbdb',
    emoji: '💗',
  },
  'ogretici-masallari': {
    isim: 'Öğretici Masallar',
    aciklama: 'Sabır, sorumluluk ve merak gibi değerleri kucaklayan masallar.',
    renk: 'var(--lavanta)',
    renkAcik: 'var(--lavanta-acik)',
    emoji: '🌱',
  },
} as const;

export type KategoriSlug = keyof typeof KATEGORILER;

// Ana navigasyon
export const NAV = [
  { href: '/', etiket: 'Anasayfa' },
  { href: '/kategori/uyku-masallari', etiket: 'Uyku' },
  { href: '/kategori/arkadaslik-masallari', etiket: 'Arkadaşlık' },
  { href: '/kategori/cesaret-masallari', etiket: 'Cesaret' },
  { href: '/kategori/sevgi-masallari', etiket: 'Sevgi' },
  { href: '/kategori/ogretici-masallari', etiket: 'Öğretici' },
] as const;
