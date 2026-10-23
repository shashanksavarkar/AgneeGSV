import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8002;

// Live reload: browsers hold an SSE connection; any file change tells them to reload
const clients = new Set();
let reloadTimer;
fs.watch(__dirname, { recursive: true }, (_, name) => {
  if (!name || /node_modules|\.git|test-results|playwright-report/.test(name)) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => clients.forEach((c) => c.write('data: reload\n\n')), 80);
});
const RELOAD_SNIPPET = '<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ics': 'text/calendar; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Parse URL safely
  let reqPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  if (reqPath === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      const notFoundPath = path.join(__dirname, '404.html');
      fs.readFile(notFoundPath, (e, data) => {
        if (!e) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (e, html) => res.end(e ? '' : html.replace('</body>', RELOAD_SNIPPET + '</body>')));
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Festival server running at http://localhost:${PORT}/`);
});
