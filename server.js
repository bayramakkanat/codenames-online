const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Oyun durumu (hafızada tutuluyor)
let gameState = null;

function getContentType(ext) {
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
  return types[ext] || 'text/plain';
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
    res.writeHead(200);
    res.end(JSON.stringify(gameState));
    return;
  }

  // API: set state
  if (pathname === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try { gameState = JSON.parse(body); res.writeHead(200); res.end('ok'); }
      catch(e) { res.writeHead(400); res.end('bad json'); }
    });
    return;
  }

  // API: update state (POST)
  if (pathname === '/api/update') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        if (gameState) Object.assign(gameState, update);
        res.writeHead(200);
        res.end('ok');
      } catch(e) { res.writeHead(400); res.end('bad json'); }
    });
    return;
  }

  // Dosya sunma
  let filePath = pathname === '/' ? '/tablet.html' : pathname;
  filePath = path.join(__dirname, filePath);

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

// VERCEL İÇİN KRİTİK DIŞA AKTARMA
module.exports = server;
