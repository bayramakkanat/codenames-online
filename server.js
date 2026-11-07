const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MAX_BODY = 100 * 1024; // 100 KB, oyun durumu için fazlasıyla yeter

// Oyun durumu (hafızada tutuluyor)
let gameState = null;

// Sadece bu dosyalar dışarıya sunulur (server.js, package.json vb. sunulmaz)
const IZINLI_DOSYALAR = {
  '/': 'tablet.html',
  '/tablet.html': 'tablet.html',
  '/spymaster.html': 'spymaster.html'
};

function getContentType(ext) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
  return types[ext] || 'text/plain';
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

function jsonYanit(res, kod, metin) {
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(kod);
  res.end(metin);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API: get state
  if (pathname === '/api/state' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    jsonYanit(res, 200, JSON.stringify(gameState));
    return;
  }

  // API: set state (tüm durumu değiştirir)
  if (pathname === '/api/state' && req.method === 'POST') {
    govdeOku(req, res, body => {
      try { gameState = JSON.parse(body); jsonYanit(res, 200, 'ok'); }
      catch (e) { jsonYanit(res, 400, 'bad json'); }
    });
    return;
  }

  // API: update state (sadece gönderilen alanları günceller, örn. {"sira":"mv"})
  if (pathname === '/api/update' && req.method === 'POST') {
    govdeOku(req, res, body => {
      try {
        const update = JSON.parse(body);
        if (gameState && update && typeof update === 'object') Object.assign(gameState, update);
        jsonYanit(res, 200, 'ok');
      } catch (e) { jsonYanit(res, 400, 'bad json'); }
    });
    return;
  }

  // Dosya sunma (sadece izinli sayfalar)
  const dosya = IZINLI_DOSYALAR[pathname];
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
