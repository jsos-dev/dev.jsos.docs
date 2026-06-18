import express from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(__dirname, 'dist', 'public');

const app = express();

app.use(express.static(PUBLIC_DIR));

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

app.get('/api/search', (req, res) => {
  const query = (req.query.query || '').toLowerCase().trim();
  if (!query || !searchDocuments) {
    return res.json([]);
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

  res.json(results);
});

app.get('*', (req, res) => {
  const path = req.path === '/' ? '/index.html' : req.path;
  const staticFile = join(PUBLIC_DIR, path);

  if (existsSync(staticFile) && !existsSync(join(PUBLIC_DIR, path + '/index.html'))) {
    return res.sendFile(staticFile);
  }

  const indexPath = join(PUBLIC_DIR, path, 'index.html');
  if (existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.sendFile(join(PUBLIC_DIR, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Docs server running on port ${PORT}`);
});
