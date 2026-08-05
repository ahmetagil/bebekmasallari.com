// ============================================================
// Masal Yazma Stüdyosu — Panel Logic
// Form yönetimi, canlı önizleme, API çağrıları, masal listesi.
// ============================================================

// --- Kategori meta (emoji için) ---
const KATEGORI_EMOJI = {
  'uyku-masallari': '🌙',
  'arkadaslik-masallari': '🤝',
  'cesaret-masallari': '🦁',
  'sevgi-masallari': '💗',
  'ogretici-masallari': '🌱',
};
const KATEGORI_ISIM = {
  'uyku-masallari': 'Uyku',
  'arkadaslik-masallari': 'Arkadaşlık',
  'cesaret-masallari': 'Cesaret',
  'sevgi-masallari': 'Sevgi',
  'ogretici-masallari': 'Öğretici',
};

// --- DOM referansları ---
const $ = (id) => document.getElementById(id);

const form = $('masal-form');
const baslikInput = $('baslik');
const slugOnizleme = $('slug-onizleme');
const aciklamaInput = $('aciklama');
const aciklamaSayac = $('aciklama-sayac');
const aciklamaDurum = $('aciklama-durum');
const icerikInput = $('icerik');
const kelimeSayac = $('kelime-sayac');
const sureInput = $('sure');
const keywordInput = $('keyword-input');
const keywordListe = $('keyword-liste');
const derslerListe = $('dersler-liste');
const sorularListe = $('sorular-liste');
const masalListesi = $('masal-listesi');
const toast = $('toast');

let keywords = [];
let duzenlemeSlug = null; // null = yeni masal, dolu = düzenleme modu

// ============================================================
// SLUG ÜRETİMİ (canlı önizleme)
// ============================================================
function slugYap(metin) {
  const harita = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
  };
  return metin
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (m) => harita[m] || m)
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

baslikInput.addEventListener('input', () => {
  const slug = slugYap(baslikInput.value);
  slugOnizleme.textContent = slug || 'otomatik-uretilecek';
});

// ============================================================
// AÇIKLAMA KARAKTER SAYACI (SEO kontrolü)
// ============================================================
aciklamaInput.addEventListener('input', () => {
  const len = aciklamaInput.value.length;
  aciklamaSayac.textContent = `${len} karakter`;

  // 150-160 ideal aralık
  aciklamaSayac.className = 'sayac';
  aciklamaDurum.textContent = '📝';
  if (len >= 150 && len <= 160) {
    aciklamaSayac.classList.add('ok');
    aciklamaDurum.textContent = '✅ İdeal';
  } else if (len > 160) {
    aciklamaSayac.classList.add('kotu');
    aciklamaDurum.textContent = '⚠️ Çok uzun (160\'ı geçme)';
  } else if (len >= 120) {
    aciklamaSayac.classList.add('uyari');
    aciklamaDurum.textContent = '⏳ Yaklaşıyor (150 hedef)';
  }
});

// ============================================================
// KELİME SAYACI + OKUMA SÜRESİ OTOMATİK
// ============================================================
icerikInput.addEventListener('input', () => {
  const kelimeler = icerikInput.value.trim().split(/\s+/).filter(Boolean);
  const sayi = kelimeler.length;
  kelimeSayac.textContent = `${sayi} kelime`;

  // Renk ipucu
  kelimeSayac.className = 'sayac';
  if (sayi >= 600 && sayi <= 900) {
    kelimeSayac.classList.add('ok');
  } else if (sayi > 900) {
    kelimeSayac.classList.add('uyari');
  }

  // Okuma süresi otomatik (200 kelime/dk)
  if (sayi > 0) {
    const dakika = Math.max(1, Math.round(sayi / 200));
    sureInput.value = dakika;
  }
});

// ============================================================
// KEYWORD (ETİKET) YÖNETİMİ
// ============================================================
function keywordRender() {
  keywordListe.innerHTML = '';
  keywords.forEach((kw, i) => {
    const etiket = document.createElement('span');
    etiket.className = 'etiket';
    etiket.innerHTML = `${kw} <button type="button" aria-label="Kaldır" data-i="${i}">×</button>`;
    etiket.querySelector('button').addEventListener('click', () => {
      keywords.splice(i, 1);
      keywordRender();
    });
    keywordListe.appendChild(etiket);
  });
}

keywordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const kw = keywordInput.value.trim().replace(/,$/, '');
    if (kw && !keywords.includes(kw)) {
      keywords.push(kw);
      keywordRender();
    }
    keywordInput.value = '';
  }
});

// ============================================================
// DİNAMİK LİSTE (Dersler, Sorular)
// ============================================================
function dinamikSatirEkle(kapsayici, deger = '') {
  const satir = document.createElement('div');
  satir.className = 'dinamik-satir';
  const sira = kapsayici.children.length + 1;

  const noSpan = document.createElement('span');
  noSpan.className = 'sira-no';
  noSpan.textContent = sira;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = kapsayici.id === 'dersler-liste'
    ? 'Bu masaldan çıkarılacak bir ders...'
    : 'Çocuğunuzla konuşmak için bir soru...';
  input.value = deger;

  const kaldirBtn = document.createElement('button');
  kaldirBtn.type = 'button';
  kaldirBtn.className = 'btn-kaldir';
  kaldirBtn.innerHTML = '×';
  kaldirBtn.setAttribute('aria-label', 'Satırı kaldır');
  kaldirBtn.addEventListener('click', () => {
    satir.remove();
    // Sıra numaralarını yeniden düzenle
    [...kapsayici.children].forEach((c, i) => {
      c.querySelector('.sira-no').textContent = i + 1;
    });
  });

  satir.appendChild(noSpan);
  satir.appendChild(input);
  satir.appendChild(kaldirBtn);
  kapsayici.appendChild(satir);
}

// "Ekle" butonları
document.querySelectorAll('.btn-ekle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const hedef = document.getElementById(btn.dataset.hedef);
    dinamikSatirEkle(hedef);
  });
});

function dinamikListeDeger(kapsayiciId) {
  const kapsayici = document.getElementById(kapsayiciId);
  return [...kapsayici.querySelectorAll('input')]
    .map((i) => i.value.trim())
    .filter(Boolean);
}

// ============================================================
// FORM TEMİZLEME
// ============================================================
function formTemizle() {
  form.reset();
  slugOnizleme.textContent = 'otomatik-uretilecek';
  aciklamaSayac.textContent = '0 karakter';
  aciklamaDurum.textContent = '📝';
  kelimeSayac.textContent = '0 kelime';
  aciklamaSayac.className = 'sayac';
  kelimeSayac.className = 'sayac';
  keywords = [];
  keywordRender();
  derslerListe.innerHTML = '';
  sorularListe.innerHTML = '';
  duzenlemeSlug = null;
  $('duzenleme-slug').value = '';
  $('btn-yayinla').textContent = '✨ Yayınla';

  // Varsayılan 3 boş satır
  for (let i = 0; i < 3; i++) {
    dinamikSatirEkle(derslerListe);
    dinamikSatirEkle(sorularListe);
  }
}

$('btn-temizle').addEventListener('click', () => {
  if (confirm('Form temizlensin mi? Yazdıklarınız silinecek.')) {
    formTemizle();
  }
});

// ============================================================
// FORM GÖNDERME (yeni masal / düzenleme)
// ============================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const veri = {
    title: baslikInput.value.trim(),
    description: aciklamaInput.value.trim(),
    kategori: $('kategori').value,
    yasAraligi: $('yas').value.trim(),
    okumaSuresi: parseInt(sureInput.value, 10) || 4,
    keywords,
    dersler: dinamikListeDeger('dersler-liste'),
    tartismaSorulari: dinamikListeDeger('sorular-liste'),
    icerik: icerikInput.value.trim(),
  };

  // Validation (detaylı)
  const hatalar = [];
  if (!veri.title) hatalar.push('Başlık');
  if (!veri.description) hatalar.push('Açıklama');
  if (!veri.kategori) hatalar.push('Kategori');
  if (!veri.yasAraligi) hatalar.push('Yaş aralığı');
  if (!veri.icerik) hatalar.push('Masal metni');
  if (veri.dersler.length < 3) hatalar.push('En az 3 ders');
  if (veri.tartismaSorulari.length < 3) hatalar.push('En az 3 tartışma sorusu');
  if (veri.keywords.length < 3) hatalar.push('En az 3 anahtar kelime');

  if (hatalar.length) {
    toastGoster(`⚠️ Eksik alanlar: ${hatalar.join(', ')}`, 'hata');
    return;
  }

  // Yayınla butonu loading
  const btn = $('btn-yayinla');
  btn.disabled = true;
  btn.textContent = '⏳ Yayınlanıyor...';

  try {
    const metod = duzenlemeSlug ? 'PUT' : 'POST';
    const url = duzenlemeSlug
      ? `/api/masal/${encodeURIComponent(duzenlemeSlug)}`
      : '/api/masal';

    const yanit = await fetch(url, {
      method: metod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veri),
    });

    const sonuc = await yanit.json();

    if (!yanit.ok) {
      const mesaj = sonuc.hatalar?.join(', ') || sonuc.hata || 'Bilinmeyen hata';
      throw new Error(mesaj);
    }

    toastGoster(`✅ "${veri.title}" başarıyla yayınlandı!`, 'basarili');
    formTemizle();
    masalListesiYukle(); // listeyi yenile

    // Otomatik build öner
    setTimeout(() => {
      if (confirm('Masal eklendi! Siteyi güncellemek (build) ister misin?')) {
        siteBuild();
      }
    }, 800);
  } catch (err) {
    toastGoster(`❌ Hata: ${err.message}`, 'hata');
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ Yayınla';
  }
});

// ============================================================
// MASAL LİSTESİ YÜKLE
// ============================================================
async function masalListesiYukle() {
  try {
    const yanit = await fetch('/api/masallar');
    const { masallar } = await yanit.json();

    $('masal-sayi').textContent = masallar.length;

    const filtre = $('filtre-kategori').value;
    const gosterilecek = filtre
      ? masallar.filter((m) => m.kategori === filtre)
      : masallar;

    if (gosterilecek.length === 0) {
      masalListesi.innerHTML = '<p class="bos-mesaj">Henüz masal yok. İlk masalını ekle! 🌟</p>';
      return;
    }

    masalListesi.innerHTML = '';
    gosterilecek.forEach((m) => {
      const satir = document.createElement('div');
      satir.className = 'msatir';

      const emoji = KATEGORI_EMOJI[m.kategori] || '📖';
      const tarih = m.pubDate
        ? new Date(m.pubDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
        : '';

      satir.innerHTML = `
        <div class="msatir-emoji">${emoji}</div>
        <div class="msatir-govde">
          <div class="msatir-baslik">${escapeHtml(m.title)}</div>
          <div class="msatir-meta">
            <span class="kategori-etiketi">${KATEGORI_ISIM[m.kategori] || m.kategori}</span>
            <span>👶 ${escapeHtml(m.yasAraligi || '')}</span>
            <span>⏱️ ${m.okumaSuresi || '?'} dk</span>
            <span>📅 ${tarih}</span>
          </div>
        </div>
        <div class="msatir-aksiyon">
          <button type="button" class="btn-duzenle" data-slug="${escapeHtml(m.slug)}">✏️ Düzenle</button>
          <button type="button" class="btn-sil" data-slug="${escapeHtml(m.slug)}" data-baslik="${escapeHtml(m.title)}">🗑 Sil</button>
        </div>
      `;

      satir.querySelector('.btn-duzenle').addEventListener('click', () => masalDuzenle(m.slug));
      satir.querySelector('.btn-sil').addEventListener('click', (e) => {
        masalSil(e.target.dataset.slug, e.target.dataset.baslik);
      });

      masalListesi.appendChild(satir);
    });
  } catch (err) {
    masalListesi.innerHTML = `<p class="bos-mesaj">❌ Yükleme hatası: ${escapeHtml(err.message)}</p>`;
  }
}

$('filtre-kategori').addEventListener('change', masalListesiYukle);

// ============================================================
// MASAL DÜZENLE
// ============================================================
async function masalDuzenle(slug) {
  try {
    const yanit = await fetch(`/api/masal/${encodeURIComponent(slug)}`);
    if (!yanit.ok) throw new Error('Masal yüklenemedi');
    const m = await yanit.json();

    // Yeni masal sekmesine geç
    sekmeGecis('yeni');

    // Formu doldur
    baslikInput.value = m.title || '';
    aciklamaInput.value = m.description || '';
    $('kategori').value = m.kategori || '';
    $('yas').value = m.yasAraligi || '';
    sureInput.value = m.okumaSuresi || 4;
    icerikInput.value = m.icerik || '';
    keywords = m.keywords || [];
    duzenlemeSlug = slug;
    $('duzenleme-slug').value = slug;
    $('btn-yayinla').textContent = '💾 Değişiklikleri Kaydet';

    // Canlı önizlemeleri tetikle
    baslikInput.dispatchEvent(new Event('input'));
    aciklamaInput.dispatchEvent(new Event('input'));
    icerikInput.dispatchEvent(new Event('input'));
    keywordRender();

    // Dersler ve sorular
    derslerListe.innerHTML = '';
    sorularListe.innerHTML = '';
    (m.dersler || []).forEach((d) => dinamikSatirEkle(derslerListe, d));
    (m.tartismaSorulari || []).forEach((s) => dinamikSatirEkle(sorularListe, s));
    // En az 3 satır
    while (dinamikListeDeger('dersler-liste').length < 3) dinamikSatirEkle(derslerListe);
    while (dinamikListeDeger('sorular-liste').length < 3) dinamikSatirEkle(sorularListe);

    toastGoster(`✏️ "${m.title}" düzenleniyor`, 'uyari');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    toastGoster(`❌ ${err.message}`, 'hata');
  }
}

// ============================================================
// MASAL SİL
// ============================================================
async function masalSil(slug, baslik) {
  const onay = await modalGoster(
    'Masalı Sil',
    `"${baslik}" kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misin?`,
    'Sil',
    'btn-danger'
  );
  if (!onay) return;

  try {
    const yanit = await fetch(`/api/masal/${encodeURIComponent(slug)}`, { method: 'DELETE' });
    if (!yanit.ok) throw new Error('Silinemedi');
    toastGoster(`🗑️ "${baslik}" silindi`, 'basarili');
    masalListesiYukle();
  } catch (err) {
    toastGoster(`❌ ${err.message}`, 'hata');
  }
}

// ============================================================
// SİTE BUILD (npm run build)
// ============================================================
async function siteBuild() {
  const btn = $('btn-build');
  btn.classList.add('calisiyor');
  btn.textContent = '⏳ Build yapılıyor...';
  toastGoster('🔨 Site güncelleniyor, bu birkaç saniye sürebilir...', 'uyari');

  try {
    const yanit = await fetch('/api/build', { method: 'POST' });
    const sonuc = await yanit.json();
    if (sonuc.tamam) {
      toastGoster('✅ Site güncellendi! Cloudflare\'e push yapman yeterli.', 'basarili');
    } else {
      toastGoster(`❌ Build hatası. Konsolu kontrol et.`, 'hata');
      console.error('Build çıktısı:', sonuc.cikti);
    }
  } catch (err) {
    toastGoster(`❌ ${err.message}`, 'hata');
  } finally {
    btn.classList.remove('calisiyor');
    btn.innerHTML = '🔨 Siteyi Güncelle';
  }
}
$('btn-build').addEventListener('click', siteBuild);

// ============================================================
// SEKME GEÇİŞLERİ
// ============================================================
function sekmeGecis(hedef) {
  document.querySelectorAll('.sekme').forEach((s) => s.classList.remove('aktif'));
  document.querySelectorAll('.gorunum').forEach((g) => g.classList.remove('aktif'));

  if (hedef === 'yeni') {
    $('sekme-yeni').classList.add('aktif');
    $('gorunum-yeni').classList.add('aktif');
  } else {
    $('sekme-liste').classList.add('aktif');
    $('gorunum-liste').classList.add('aktif');
    masalListesiYukle();
  }
}
$('sekme-yeni').addEventListener('click', () => sekmeGecis('yeni'));
$('sekme-liste').addEventListener('click', () => sekmeGecis('liste'));

// ============================================================
// TOAST BİLDİRİM
// ============================================================
let toastTimer;
function toastGoster(mesaj, tip = '') {
  clearTimeout(toastTimer);
  toast.textContent = mesaj;
  toast.className = 'toast goster ' + tip;
  toastTimer = setTimeout(() => toast.classList.remove('goster'), 3500);
}

// ============================================================
// MODAL (onay iletişim kutusu)
// ============================================================
function modalGoster(baslik, mesaj, onayMetin, onayClass = 'btn-danger') {
  return new Promise((coz) => {
    const modal = $('modal');
    $('modal-baslik').textContent = baslik;
    $('modal-mesaj').textContent = mesaj;
    const onayBtn = $('modal-onayla');
    const iptalBtn = $('modal-iptal');

    onayBtn.textContent = onayMetin;
    onayBtn.className = onayClass;

    modal.hidden = false;

    const kapat = (sonuc) => {
      modal.hidden = true;
      onayBtn.onclick = null;
      iptalBtn.onclick = null;
      coz(sonuc);
    };
    onayBtn.onclick = () => kapat(true);
    iptalBtn.onclick = () => kapat(false);
  });
}

// ============================================================
// YARDIMCILAR
// ============================================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ============================================================
// BAŞLATMA
// ============================================================
formTemizle();
masalListesiYukle();
