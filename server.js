const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3456;
const LOCAL_IP = getLocalIP();

// Game state (shared in memory)
let gameState = null;

function getContentType(ext) {
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
  return types[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers
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

  // Serve files
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

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎮 CODENAMES TÜRKÇE - Sunucu Başlatıldı!\n');
  console.log(`📱 Tablet için açın: http://${LOCAL_IP}:${PORT}/`);
  console.log(`🕵️  Spymaster için: http://${LOCAL_IP}:${PORT}/spymaster.html`);
  console.log('\nQR kod tablet ekranında otomatik gösterilecek.');
  console.log('Herkesi aynı WiFi ağına bağlayın.\n');
});
