/* Bharat Setu — build step.
   The app is intentionally a zero-dependency static bundle: no bundler, no
   transpile step, so the same bytes run in the sandbox, on Vercel, and offline
   in a service worker. This script only validates integrity and reports sizes. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const REQUIRED = [
  'index.html', 'manifest.webmanifest', 'sw.js',
  'static/app.css', 'static/app.js', 'static/schemes.js',
  'static/i18n.js', 'static/engine.js', 'static/icon.svg',
];

let fail = 0;
console.log('\n🇮🇳  Bharat Setu — build\n');

for (const rel of REQUIRED) {
  const p = path.join(PUBLIC, rel);
  if (!fs.existsSync(p)) { console.error(`  ✗ MISSING  ${rel}`); fail++; continue; }
  const kb = fs.statSync(p).size / 1024;
  console.log(`  ✓ ${rel.padEnd(28)} ${kb.toFixed(1).padStart(7)} KB`);
}

// sanity: i18n has 12+ languages, schemes.js has 40+ schemes
const i18n = fs.readFileSync(path.join(PUBLIC, 'static/i18n.js'), 'utf8');
const langs = (i18n.match(/^\s{2}([a-z]{2}):\s*\{\s*$/gm) || []).length;
const schemes = fs.readFileSync(path.join(PUBLIC, 'static/schemes.js'), 'utf8');
const schemeCount = (schemes.match(/^    id: "/gm) || []).length;

console.log(`\n  languages: ${langs}   schemes: ${schemeCount}`);

// every scheme must carry an official link
const urls = (schemes.match(/apply_url: "([^"]+)"/g) || []).length;
if (urls !== schemeCount) { console.error(`  ✗ ${schemeCount} schemes but ${urls} official links`); fail++; }
else console.log('  ✓ every scheme has an official portal link');

// every scheme id must be unique
const ids = [...schemes.matchAll(/^    id: "([^"]+)"/gm)].map(m => m[1]);
if (new Set(ids).size !== ids.length) { console.error('  ✗ duplicate scheme ids'); fail++; }
else console.log('  ✓ scheme ids are unique');

// api handler + kb present
for (const f of ['api/ai.js', 'api/kb.js']) {
  if (!fs.existsSync(path.join(ROOT, f))) { console.error(`  ✗ MISSING ${f}`); fail++; }
  else console.log(`  ✓ ${f}`);
}

const total = REQUIRED.reduce((a, r) => a + fs.statSync(path.join(PUBLIC, r)).size, 0);
console.log(`\n  total static payload: ${(total / 1024).toFixed(1)} KB (uncompressed)\n`);

if (fail) { console.error(`BUILD FAILED — ${fail} problem(s)\n`); process.exit(1); }
console.log('  BUILD OK ✅\n');
