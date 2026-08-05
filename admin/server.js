// ============================================================
// Masal Yazma Stüdyosu — Admin Server
// Sadece lokalde çalışır (localhost:4322). Sıfır bağımlılık —
// Node'un yerleşik modülleriyle (http, fs) yazıldı.
//
// API:
//   GET    /api/masallar        → tüm masalları listele
//   GET    /api/masal/:slug     → tek masal getir (düzenleme için)
//   POST   /api/masal           → yeni masal oluştur
//   PUT    /api/masal/:slug     → masal düzenle
//   DELETE /api/masal/:slug     → masal sil
//   POST   /api/build           → astro build çalıştır (siteyi güncelle)
// ============================================================

import { createServer } from 'node:http';
import { readFile, writeFile, readdir, unlink, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJE_KOKU = join(__dirname, '..');
const MASALAR_KLASORU = join(PROJE_KOKU, 'src', 'content', 'masallar');
const PORT = 4322;
const PUBLIC_KLASORU = join(__dirname, 'public');

// Türkçe karakterleri slug'a çevir
function slugYap(baslik) {
  const harita = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };
  return baslik
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (m) => harita[m] || m)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // özel karakterleri at
    .replace(/\s+/g, '-')            // boşluk → tire
    .replace(/-+/g, '-')             // çoklu tire → tek tire
    .replace(/^-|-$/g, '');          // baştaki/sondaki tire
}

// Bir sonraki dosya numarasını bul (11-masal.md, 12-masal.md...)
async function sonrakiNumara() {
  const dosyalar = await readdir(MASALAR_KLASORU);
  const numaralar = dosyalar
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseInt(f.split('-')[0], 10))
    .filter((n) => !isNaN(n));
  return numaralar.length > 0 ? Math.max(...numaralar) + 1 : 1;
}

// Frontmatter + içerik → tam .md dosyası içeriği
function markdownUret(veri) {
  const dersler = (veri.dersler || [])
    .filter((d) => d.trim())
    .map((d) => `  - "${d.replace(/"/g, '\\"')}"`)
    .join('\n');
  const sorular = (veri.tartismaSorulari || [])
    .filter((s) => s.trim())
    .map((s) => `  - "${s.replace(/"/g, '\\"')}"`)
    .join('\n');
  const keywords = (veri.keywords || [])
    .filter((k) => k.trim())
    .map((k) => `  - "${k.replace(/"/g, '\\"')}"`)
    .join('\n');

  // ISO tarih (YYYY-MM-DD)
  const tarih = new Date(veri.pubDate || new Date());
  const isoTarih = tarih.toISOString().split('T')[0];

  return `---
title: "${veri.title.replace(/"/g, '\\"')}"
description: "${veri.description.replace(/"/g, '\\"')}"
pubDate: ${isoTarih}
kategori: "${veri.kategori}"
yasAraligi: "${veri.yasAraligi}"
okumaSuresi: ${parseInt(veri.okumaSuresi, 10) || 4}
dersler:
${dersler || '  - "Bu masaldan bir ders eklenecek."'}
tartismaSorulari:
${sorular || '  - "Bir tartışma sorusu eklenecek."'}
keywords:
${keywords || '  - "anahtar kelime"'}
author: "bebekmasallari.com"
---

${veri.icerik.trim()}
`;
}

// .md dosyasını parse et → frontmatter + içerik
function markdownParse(md) {
  const eslesme = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!eslesme) return { frontmatter: {}, icerik: md };

  const [, fmMetin, icerik] = eslesme;
  const frontmatter = {};
  let mevcutAnahtar = null;
  let mevcutListe = null;

  for (const satir of fmMetin.split('\n')) {
    // Liste öğesi (  - "değer")
    const listeEslesme = satir.match(/^\s+- ["'](.+)["']$/);
    if (listeEslesme && mevcutListe) {
      mevcutListe.push(listeEslesme[1]);
      continue;
    }
    // Anahtar: değer
    const anahtarEslesme = satir.match(/^(\w+):\s*(.*)$/);
    if (anahtarEslesme) {
      const [, anahtar, deger] = anahtarEslesme;
      if (deger === '' || deger === undefined) {
        // Bir liste başlıyor
        mevcutListe = [];
        frontmatter[anahtar] = mevcutListe;
        mevcutAnahtar = anahtar;
      } else {
        // Tırnak işaretlerini temizle
        mevcutListe = null;
        let temizDeger = deger;
        if ((temizDeger.startsWith('"') && temizDeger.endsWith('"')) ||
            (temizDeger.startsWith("'") && temizDeger.endsWith("'"))) {
          temizDeger = temizDeger.slice(1, -1);
        }
        // Sayısal mı?
        if (/^\d+$/.test(temizDeger)) {
          frontmatter[anahtar] = parseInt(temizDeger, 10);
        } else {
          frontmatter[anahtar] = temizDeger;
        }
      }
    }
  }
  return { frontmatter, icerik: icerik.trim() };
}

// Bir .md dosyasından slug çıkar (dosya adından)
function dosyadanSlug(dosyaAdi) {
  // "11-uyku-getiren-yildiz.md" → "uyku-getiren-yildiz"
  return dosyaAdi.replace(/^\d+-/, '').replace(/\.md$/, '');
}

// Bir .md dosyasından numara çıkar
function dosyadanNumara(dosyaAdi) {
  return parseInt(dosyaAdi.split('-')[0], 10) || 0;
}

// ============================================================
// HTTP istek yardımcıları
// ============================================================
async function govdeOku(req) {
  const parcalar = [];
  for await (const parca of req) parcalar.push(parca);
  return Buffer.concat(parcalar).toString('utf8');
}

function jsonGonder(res, veri, durum = 200) {
  res.writeHead(durum, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(veri));
}

async function statikDosyaSun(res, dosyaYolu, contentType) {
  try {
    const icerik = await readFile(dosyaYolu);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(icerik);
  } catch {
    res.writeHead(404);
    res.end('Bulunamadı');
  }
}

// ============================================================
// Sunucu
// ============================================================
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const yol = url.pathname;
  const metod = req.method;

  // CORS yok (lokal) — ama yine de header ekle
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (metod === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // ---------- Statik dosyalar (panel UI) ----------
    if (yol === '/' || yol === '/index.html') {
      return await statikDosyaSun(res, join(PUBLIC_KLASORU, 'index.html'), 'text/html; charset=utf-8');
    }
    if (yol === '/style.css') {
      return await statikDosyaSun(res, join(PUBLIC_KLASORU, 'style.css'), 'text/css; charset=utf-8');
    }
    if (yol === '/app.js') {
      return await statikDosyaSun(res, join(PUBLIC_KLASORU, 'app.js'), 'application/javascript; charset=utf-8');
    }

    // ---------- API: Tüm masalları listele ----------
    if (yol === '/api/masallar' && metod === 'GET') {
      const dosyalar = (await readdir(MASALAR_KLASORU))
        .filter((f) => f.endsWith('.md'))
        .sort((a, b) => dosyadanNumara(b) - dosyadanNumara(a)); // yeniden eskiye

      const masallar = await Promise.all(
        dosyalar.map(async (dosya) => {
          const icerik = await readFile(join(MASALAR_KLASORU, dosya), 'utf8');
          const { frontmatter } = markdownParse(icerik);
          return {
            dosya,
            slug: dosyadanSlug(dosya),
            numara: dosyadanNumara(dosya),
            ...frontmatter,
          };
        })
      );
      return jsonGonder(res, { masallar });
    }

    // ---------- API: Tek masal getir ----------
    const tekEslesme = yol.match(/^\/api\/masal\/([^/]+)$/);
    if (tekEslesme && metod === 'GET') {
      const istenenSlug = decodeURIComponent(tekEslesme[1]);
      const dosyalar = await readdir(MASALAR_KLASORU);
      const dosya = dosyalar.find((f) => dosyadanSlug(f) === istenenSlug);
      if (!dosya) return jsonGonder(res, { hata: 'Masal bulunamadı' }, 404);

      const icerik = await readFile(join(MASALAR_KLASORU, dosya), 'utf8');
      const { frontmatter, icerik: metin } = markdownParse(icerik);
      return jsonGonder(res, {
        dosya,
        slug: dosyadanSlug(dosya),
        numara: dosyadanNumara(dosya),
        ...frontmatter,
        icerik: metin,
      });
    }

    // ---------- API: Yeni masal oluştur ----------
    if (yol === '/api/masal' && metod === 'POST') {
      const veri = JSON.parse(await govdeOku(req));

      // Validation
      const hatalar = [];
      if (!veri.title?.trim()) hatalar.push('Başlık gerekli');
      if (!veri.description?.trim()) hatalar.push('Açıklama gerekli');
      if (!veri.icerik?.trim()) hatalar.push('Masal metni gerekli');
      if (!veri.kategori) hatalar.push('Kategori gerekli');
      if (hatalar.length) return jsonGonder(res, { hatalar }, 400);

      const slug = slugYap(veri.title);
      const numara = await sonrakiNumara();
      const dosyaAdi = `${numara}-${slug}.md`;
      const dosyaYolu = join(MASALAR_KLASORU, dosyaAdi);

      if (existsSync(dosyaYolu)) {
        return jsonGonder(res, { hata: 'Bu başlıkta bir masal zaten var' }, 409);
      }

      const md = markdownUret({ ...veri, pubDate: veri.pubDate || new Date() });
      await writeFile(dosyaYolu, md, 'utf8');

      return jsonGonder(res, { tamam: true, dosya: dosyaAdi, slug, numara });
    }

    // ---------- API: Masal düzenle ----------
    const duzenleEslesme = yol.match(/^\/api\/masal\/([^/]+)$/);
    if (duzenleEslesme && metod === 'PUT') {
      const eskiSlug = decodeURIComponent(duzenleEslesme[1]);
      const veri = JSON.parse(await govdeOku(req));

      const hatalar = [];
      if (!veri.title?.trim()) hatalar.push('Başlık gerekli');
      if (!veri.icerik?.trim()) hatalar.push('Masal metni gerekli');
      if (hatalar.length) return jsonGonder(res, { hatalar }, 400);

      const dosyalar = await readdir(MASALAR_KLASORU);
      const eskiDosya = dosyalar.find((f) => dosyadanSlug(f) === eskiSlug);
      if (!eskiDosya) return jsonGonder(res, { hata: 'Masal bulunamadı' }, 404);

      const numara = dosyadanNumara(eskiDosya);
      const yeniSlug = slugYap(veri.title);
      const yeniDosyaAdi = `${numara}-${yeniSlug}.md`;
      const eskiDosyaYolu = join(MASALAR_KLASORU, eskiDosya);
      const yeniDosyaYolu = join(MASALAR_KLASORU, yeniDosyaAdi);

      const md = markdownUret(veri);
      await writeFile(yeniDosyaYolu, md, 'utf8');

      // Eski dosya adından farklıysa sil
      if (eskiDosya !== yeniDosyaAdi) {
        await unlink(eskiDosyaYolu);
      }

      return jsonGonder(res, { tamam: true, dosya: yeniDosyaAdi, slug: yeniSlug });
    }

    // ---------- API: Masal sil ----------
    const silEslesme = yol.match(/^\/api\/masal\/([^/]+)$/);
    if (silEslesme && metod === 'DELETE') {
      const slug = decodeURIComponent(silEslesme[1]);
      const dosyalar = await readdir(MASALAR_KLASORU);
      const dosya = dosyalar.find((f) => dosyadanSlug(f) === slug);
      if (!dosya) return jsonGonder(res, { hata: 'Masal bulunamadı' }, 404);

      await unlink(join(MASALAR_KLASORU, dosya));
      return jsonGonder(res, { tamam: true });
    }

    // ---------- API: Astro build çalıştır ----------
    if (yol === '/api/build' && metod === 'POST') {
      const build = spawn('npm', ['run', 'build'], {
        cwd: PROJE_KOKU,
        shell: true,
        stdio: 'pipe',
      });

      let cikti = '';
      build.stdout.on('data', (d) => (cikti += d.toString()));
      build.stderr.on('data', (d) => (cikti += d.toString()));

      build.on('close', (kod) => {
        jsonGonder(res, { tamam: kod === 0, kod, cikti: cikti.slice(-2000) });
      });
      return; // async bitmesini bekle
    }

    // ---------- 404 ----------
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hata: 'Bilinmeyen endpoint: ' + yol }));
  } catch (err) {
    console.error('Hata:', err);
    jsonGonder(res, { hata: err.message }, 500);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n  🌙 Masal Yazma Stüdyosu');
  console.log(`  📝 http://localhost:${PORT}\n`);
  console.log('  Paneli kapatmak için: Ctrl+C\n');
});
