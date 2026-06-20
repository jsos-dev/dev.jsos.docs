import { createServer } from 'http';
import { existsSync, readFileSync, createReadStream, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(__dirname, 'dist', 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip'
};

const searchIndexPath = join(PUBLIC_DIR, 'api', 'search.json');
let searchDocuments = null;
try {
  if (existsSync(searchIndexPath)) {
    searchDocuments = JSON.parse(readFileSync(searchIndexPath, 'utf-8'));
    console.log(`Loaded search index: ${searchDocuments.length} documents`);
  }
} catch (e) {
  console.warn('No search index found');
}

function serveStaticFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const stat = statSync(filePath);
    if (stat.isFile()) {
      res.writeHead(200, { 'Content-Type': contentType });
      createReadStream(filePath).pipe(res);
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

function handleSearchAPI(req, res) {
  const parsedUrl = parse(req.url, true);
  const query = (parsedUrl.query.query || '').toLowerCase().trim();

  if (!query || !searchDocuments) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
    return;
  }

  const terms = query.split(/\s+/).filter(Boolean);
  const scored = searchDocuments.map((doc) => {
    const lower = doc.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (lower.includes(term)) {
        score += term.length;
        const idx = lower.indexOf(term);
        score += Math.max(0, 50 - idx * 0.1);
      }
    }
    return { ...doc, score };
  });

  const results = scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ content, score, ...rest }) => rest);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
}

function handleStaticFiles(req, res) {
  const parsedUrl = parse(req.url, true);
  let path = parsedUrl.pathname;

  if (path === '/') {
    path = '/index.html';
  }

  const staticFile = join(PUBLIC_DIR, path);

  if (existsSync(staticFile) && !existsSync(join(PUBLIC_DIR, path + '/index.html'))) {
    if (serveStaticFile(res, staticFile)) return;
  }

  const indexPath = join(PUBLIC_DIR, path, 'index.html');
  if (existsSync(indexPath)) {
    if (serveStaticFile(res, indexPath)) return;
  }

  const notFoundPath = join(PUBLIC_DIR, '404.html');
  if (existsSync(notFoundPath)) {
    serveStaticFile(res, notFoundPath);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/api/search')) {
    handleSearchAPI(req, res);
  } else if (req.method === 'GET') {
    handleStaticFiles(req, res);
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

server.listen(PORT, () => {
  console.log(`Docs server running on port ${PORT}`);
});