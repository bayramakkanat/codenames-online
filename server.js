const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MAX_BODY = 100 * 1024; // 100 KB, oyun durumu için fazlasıyla yeter

// Kelime listesi tablet.html içindeki KELIMELER dizisinden okunur (tek kaynak, iki yerde kopya yok)
function kelimeleriYukle() {
  const html = fs.readFileSync(path.join(__dirname, 'tablet.html'), 'utf8');
  const m = html.match(/KELIMELER\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) throw new Error('tablet.html içinde KELIMELER listesi bulunamadı');
  const liste = require('vm').runInNewContext('(' + m[1] + ')');
  if (!Array.isArray(liste) || liste.length < 25) throw new Error('KELIMELER listesi geçersiz veya 25 kelimeden az');
  return [...new Set(liste.map(String))]; // tekrar eden kelime olmasın
}
const KELIMELER = kelimeleriYukle();

// ---------- ORTAK OYUN DURUMU (hafızada) ----------
// tablet.html ve spymaster.html bu durumu /api/state ile okuyup yazar.
// oyuncu.html (telefon modu) ise aşağıdaki /api/durum, /api/rol, /api/hamle, /api/pas, /api/yeni uçlarını kullanır.
let gameState = null;

// ---------- TELEFON MODU: roller ve olaylar ----------
const TEK_ROLLER = ['krKaptan', 'mvKaptan', 'krSpy', 'mvSpy']; // takım başına tek kişi
const TUM_ROLLER = [...TEK_ROLLER, 'krOyuncu', 'mvOyuncu'];
const ROL_SURE_MS = 45000; // bu kadar süre yoklama yapmayan kişinin tekil rolü boşa sayılır
const kisiler = {}; // id -> { rol, ts }
let sonOlay = null;
let olaySayac = 0;

const IZINLI_DOSYALAR = {
  '/': 'tablet.html',
  '/tablet.html': 'tablet.html',
  '/spymaster.html': 'spymaster.html',
  '/oyuncu.html': 'oyuncu.html',
  '/oyuncu': 'oyuncu.html'
};

function getContentType(ext) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
  return types[ext] || 'text/plain';
}

function takimAd(t) { return t === 'kr' ? 'Kırmızı' : 'Mavi'; }
function idGecerli(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id); }

function karistir(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// tablet.html'deki yeniOyunOlustur ile aynı kurallar
function yeniOyunOlustur() {
  const kel = karistir(KELIMELER).slice(0, 25);
  const ren = karistir([...Array(9).fill('kr'), ...Array(8).fill('mv'), 'sk', ...Array(7).fill('ms')]);
  return {
    kartlar: kel.map((k, i) => ({ k, r: ren[i], a: false })),
    sira: 'kr', kr: 0, mv: 0, krH: 9, mvH: 8, bitti: false, kazanan: null, ts: Date.now()
  };
}

function kisiGuncelle(id) {
  const k = kisiler[id] || (kisiler[id] = { rol: null, ts: 0 });
  k.ts = Date.now();
  return k;
}

// Tekil rolün şu an (yakın zamanda yoklama yapan) sahibi
function sahip(rol) {
  const simdi = Date.now();
  for (const id of Object.keys(kisiler)) {
    const k = kisiler[id];
    if (k.rol === rol && simdi - k.ts < ROL_SURE_MS) return id;
  }
  return null;
}

function olayYaz(o) {
  sonOlay = Object.assign({ n: ++olaySayac, ts: Date.now() }, o);
}

function hamleUygula(i) {
  const o = gameState, c = o.kartlar[i], r = c.r, hamleSira = o.sira;
  c.a = true;
  let tur = false, sebep = '';
  if (r === 'sk') {
    o.bitti = true; o.kazanan = 'sk';
  } else {
    if (r === 'kr') o.kr++;
    if (r === 'mv') o.mv++;
    if (o.kr >= o.krH) { o.bitti = true; o.kazanan = 'kr'; }
    if (o.mv >= o.mvH) { o.bitti = true; o.kazanan = 'mv'; }
    if (!o.bitti && r !== o.sira) {
      sebep = r === 'ms' ? 'Masum sivil bulundu — tur geçiyor.' : `${takimAd(r)} takımın kartı basıldı — tur geçiyor.`;
      o.sira = o.sira === 'kr' ? 'mv' : 'kr';
      tur = true;
    }
  }
  olayYaz({ tip: 'hamle', kelime: c.k, renk: r, hamleSira, sira: o.sira, tur, sebep, bitti: o.bitti });
}

// ---------- YARDIMCILAR ----------
function jsonYanit(res, kod, nesne) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(kod);
  res.end(typeof nesne === 'string' ? nesne : JSON.stringify(nesne));
}

function metinYanit(res, kod, metin) {
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(kod);
  res.end(metin);
}

// İstek gövdesini okur; çok büyükse keser
function govdeOku(req, res, callback) {
  let body = '';
  let tooBig = false;
  req.on('data', d => {
    if (tooBig) return;
    body += d;
    if (body.length > MAX_BODY) {
      tooBig = true;
      res.writeHead(413);
      res.end('too large');
      req.destroy();
    }
  });
  req.on('end', () => { if (!tooBig) callback(body); });
}

function jsonGovde(req, res, callback) {
  govdeOku(req, res, body => {
    let obj;
    try { obj = JSON.parse(body); } catch (e) { return jsonYanit(res, 400, { hata: 'Geçersiz istek' }); }
    if (!obj || typeof obj !== 'object') return jsonYanit(res, 400, { hata: 'Geçersiz istek' });
    callback(obj);
  });
}

// Kaptan doğrulaması: geçerli kimlik + kaptan rolü + rolün hâlâ bu kişide olması
function kaptanBul(id) {
  if (!idGecerli(id)) return null;
  const k = kisiGuncelle(id);
  if (!k.rol || !k.rol.endsWith('Kaptan')) return null;
  if (sahip(k.rol) !== id) return null;
  return k;
}

// ---------- TELEFON MODU UÇLARI ----------
function durumYaniti(id) {
  if (!gameState) gameState = yeniOyunOlustur();
  const k = idGecerli(id) ? kisiGuncelle(id) : null;
  const ben = k ? k.rol : null;
  const spy = ben === 'krSpy' || ben === 'mvSpy';
  const o = gameState;
  // Renkleri sadece spymaster (ve oyun bitince herkes) görür; açılmamış kartların rengi diğerlerine gönderilmez
  const goster = spy || o.bitti;
  const oyun = {
    kartlar: o.kartlar.map(c => (c.a || goster) ? { k: c.k, a: c.a, r: c.r } : { k: c.k, a: false }),
    sira: o.sira, kr: o.kr, mv: o.mv, krH: o.krH, mvH: o.mvH, bitti: o.bitti, kazanan: o.kazanan
  };
  const roller = {};
  for (const r of TEK_ROLLER) {
    const s = sahip(r);
    roller[r] = !!s && s !== id;
  }
  return { oyun, roller, ben, olay: sonOlay };
}

function telefonUclari(pathname, req, res, url) {
  if (pathname === '/api/durum' && req.method === 'GET') {
    jsonYanit(res, 200, durumYaniti(url.searchParams.get('id')));
    return true;
  }

  if (pathname === '/api/rol' && req.method === 'POST') {
    jsonGovde(req, res, b => {
      if (!idGecerli(b.id)) return jsonYanit(res, 400, { hata: 'Geçersiz kimlik' });
      const rol = b.rol === null ? null : b.rol;
      if (rol !== null && !TUM_ROLLER.includes(rol)) return jsonYanit(res, 400, { hata: 'Geçersiz rol' });
      const k = kisiGuncelle(b.id);
      if (rol !== null && TEK_ROLLER.includes(rol)) {
        const s = sahip(rol);
        if (s && s !== b.id) return jsonYanit(res, 409, { hata: 'Bu rol dolu' });
        // Süresi dolmuş eski sahibin rolünü temizle, böylece aynı role iki kişi sahip olmaz
        for (const oid of Object.keys(kisiler)) {
          if (oid !== b.id && kisiler[oid].rol === rol) kisiler[oid].rol = null;
        }
      }
      k.rol = rol;
      jsonYanit(res, 200, { ok: true });
    });
    return true;
  }

  if (pathname === '/api/hamle' && req.method === 'POST') {
    jsonGovde(req, res, b => {
      const k = kaptanBul(b.id);
      if (!k) return jsonYanit(res, 403, { hata: 'Sadece kaptan dokunabilir' });
      const o = gameState;
      if (!o) return jsonYanit(res, 409, { hata: 'Oyun yok' });
      if (o.bitti) return jsonYanit(res, 409, { hata: 'Oyun bitti' });
      if (o.sira !== k.rol.slice(0, 2)) return jsonYanit(res, 403, { hata: 'Sıra sizde değil' });
      const i = b.i;
      if (!Number.isInteger(i) || i < 0 || i >= o.kartlar.length) return jsonYanit(res, 400, { hata: 'Geçersiz kart' });
      if (o.kartlar[i].a) return jsonYanit(res, 409, { hata: 'Kart zaten açık' });
      hamleUygula(i);
      jsonYanit(res, 200, { ok: true });
    });
    return true;
  }

  if (pathname === '/api/pas' && req.method === 'POST') {
    jsonGovde(req, res, b => {
      const k = kaptanBul(b.id);
      if (!k) return jsonYanit(res, 403, { hata: 'Sadece kaptan pas geçebilir' });
      const o = gameState;
      if (!o || o.bitti) return jsonYanit(res, 409, { hata: 'Oyun bitti' });
      const takim = k.rol.slice(0, 2);
      if (o.sira !== takim) return jsonYanit(res, 403, { hata: 'Sıra sizde değil' });
      o.sira = takim === 'kr' ? 'mv' : 'kr';
      olayYaz({ tip: 'pas', sira: o.sira, tur: true, sebep: `${takimAd(takim)} takım pas geçti.` });
      jsonYanit(res, 200, { ok: true });
    });
    return true;
  }

  if (pathname === '/api/yeni' && req.method === 'POST') {
    jsonGovde(req, res, b => {
      const k = kaptanBul(b.id);
      if (!k) return jsonYanit(res, 403, { hata: 'Sadece kaptan yeni oyun başlatabilir' });
      gameState = yeniOyunOlustur();
      olayYaz({ tip: 'yeni', sira: 'kr', tur: false, sebep: '' });
      jsonYanit(res, 200, { ok: true });
    });
    return true;
  }

  return false;
}

// Eski kayıtları temizle (30 dakikadır yoklama yapmayan kimlikler)
setInterval(() => {
  const simdi = Date.now();
  for (const id of Object.keys(kisiler)) {
    if (simdi - kisiler[id].ts > 30 * 60 * 1000) delete kisiler[id];
  }
}, 5 * 60 * 1000).unref();

// Ana adres (/) telefondan açılırsa telefon moduna (oyuncu.html), tablet/bilgisayardan açılırsa tablet moduna gider.
// /tablet.html ve /oyuncu.html adresleri her zaman kendi sayfasını açar.
function telefonMu(req) {
  const ua = String(req.headers['user-agent'] || '');
  return /iPhone|iPod|Windows Phone|Android.*Mobile|Mobile.*Android/i.test(ua);
}

// ---------- SUNUCU ----------
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API: get state (tablet.html ve spymaster.html)
  if (pathname === '/api/state' && req.method === 'GET') {
    jsonYanit(res, 200, JSON.stringify(gameState));
    return;
  }

  // API: set state (tüm durumu değiştirir)
  if (pathname === '/api/state' && req.method === 'POST') {
    govdeOku(req, res, body => {
      try { gameState = JSON.parse(body); metinYanit(res, 200, 'ok'); }
      catch (e) { metinYanit(res, 400, 'bad json'); }
    });
    return;
  }

  // API: update state (sadece gönderilen alanları günceller)
  if (pathname === '/api/update' && req.method === 'POST') {
    govdeOku(req, res, body => {
      try {
        const update = JSON.parse(body);
        if (gameState && update && typeof update === 'object') Object.assign(gameState, update);
        metinYanit(res, 200, 'ok');
      } catch (e) { metinYanit(res, 400, 'bad json'); }
    });
    return;
  }

  // Telefon modu uçları
  if (telefonUclari(pathname, req, res, url)) return;

  // Dosya sunma (sadece izinli sayfalar)
  let dosya = IZINLI_DOSYALAR[pathname];
  if (pathname === '/' && telefonMu(req)) dosya = 'oyuncu.html';
  res.setHeader('Vary', 'User-Agent');
  if (!dosya) { res.writeHead(404); res.end('Not found'); return; }

  const filePath = path.join(__dirname, dosya);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.setHeader('Content-Type', getContentType(path.extname(filePath)));
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🎮 CODENAMES TÜRKÇE - Sunucu ${PORT} portunda aktif!`);
});
