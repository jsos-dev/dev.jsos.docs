import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'docs');
const OUTPUT_DIR = join(ROOT, 'dist', 'public', 'api');
const OUTPUT_FILE = join(OUTPUT_DIR, 'search.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) frontmatter[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { frontmatter, body: match[2].trim() };
}

function stripMdx(content) {
  return content
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/{@?\w+[^}]*}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`>|\\\-]/g, '')
    .replace(/\n{3,}/g, '\n')
    .trim();
}

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.name.endsWith('.mdx') && entry.name !== 'index.mdx') {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const files = walkDir(CONTENT_DIR);

  const documents = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    const relPath = relative(CONTENT_DIR, file).replace(/\.mdx$/, '').replace(/\\/g, '/');
    const url = `/docs/${relPath}`;
    const stripped = stripMdx(body);
    const title = frontmatter.title || relPath.split('/').pop() || 'Untitled';
    const description = frontmatter.description || '';

    documents.push({
      id: url,
      content: title + '\n' + (description ? description + '\n' : '') + stripped,
      url,
      title,
      description,
      type: 'page',
      breadcrumbs: [title],
    });
  }

  const indexContent = readFileSync(join(CONTENT_DIR, 'index.mdx'), 'utf-8');
  const { frontmatter: idxFm, body: idxBody } = parseFrontmatter(indexContent);
  documents.unshift({
    id: '/docs',
    content: (idxFm.title || 'Overview') + '\n' + (idxFm.description || '') + '\n' + stripMdx(idxBody),
    url: '/docs',
    title: idxFm.title || 'Overview',
    description: idxFm.description || '',
    type: 'page',
    breadcrumbs: [idxFm.title || 'Overview'],
  });

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(documents));
  console.log(`Search index generated: ${OUTPUT_FILE} (${documents.length} documents)`);
}

import { relative } from 'path';
main();
