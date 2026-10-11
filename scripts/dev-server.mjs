/* Bharat Setu — local development / sandbox server.
   Serves public/ as static, and mounts api/ai.js as the /api/ai endpoint so the
   sandbox behaves exactly like the deployed Vercel runtime (same handler
   signature: (req, res)). Loads the LLM key from .env, .dev.vars or
   ~/.genspark_llm.yaml so no key is ever committed. */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);

/* ————— load environment (never committed) ————— */
function loadEnv() {
  // 1. .env / .dev.vars (simple KEY=VALUE)
  for (const f of ['.env', '.dev.vars', '.env.local']) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^["']|["']$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
  // 2. Genspark LLM config (sandbox convenience)
  const y = path.join(os.homedir(), '.genspark_llm.yaml');
  if (fs.existsSync(y)) {
    const txt = fs.readFileSync(y, 'utf8');
    const k = txt.match(/api_key:\s*(\S+)/);
    const b = txt.match(/base_url:\s*(\S+)/);
    if (k && !process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = k[1];
    if (b && !process.env.OPENAI_BASE_URL) process.env.OPENAI_BASE_URL = b[1];
  }
}
loadEnv();

/* ————— static serving ————— */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
};

function sendFile(res, file, extra = {}) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    ...extra,
  });
  fs.createReadStream(file).pipe(res);
}

function resolveStatic(urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const full = path.join(PUBLIC, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(PUBLIC)) return null;
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  // cleanUrls: /finder -> /finder.html, and SPA fallback for hash routes is just index
  const noExt = full + '.html';
  if (fs.existsSync(noExt)) return noExt;
  return null;
}

/* ————— handler adapter: node http req/res -> Vercel-style req/res ————— */
const { default: aiHandler } = await import(path.join(ROOT, 'api', 'ai.js')).catch(e => {
  console.error('⚠️  Could not load api/ai.js:', e.message);
  return { default: null };
});

function adapt(req, res, body) {
  req.body = body;
  req.query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
    return res;
  };
  res.send = (s) => res.end(s);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  // API
  if (p === '/api/ai' || p.startsWith('/api/')) {
    if (!aiHandler) { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, reason: 'handler_missing' })); return; }
    let raw = '';
    if (req.method === 'POST') {
      for await (const chunk of req) { raw += chunk; if (raw.length > 1e6) break; }
    }
    adapt(req, res, raw);
    try { await aiHandler(req, res); }
    catch (e) {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, reason: 'exception', detail: String(e.message) }));
    }
    return;
  }

  // Static
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  const file = resolveStatic(p);
  if (file) {
    const headers = {};
    if (file.endsWith('index.html')) headers['Cache-Control'] = 'no-cache';
    else if (p.startsWith('/static/')) headers['Cache-Control'] = 'public, max-age=600';
    if (p === '/sw.js') { headers['Cache-Control'] = 'no-cache'; headers['Service-Worker-Allowed'] = '/'; }
    sendFile(res, file, headers);
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404</h1><p>Not found. <a href="/">Go to Bharat Setu</a></p>');
});

server.listen(PORT, '0.0.0.0', () => {
  const ai = process.env.OPENAI_API_KEY ? 'ENABLED ✅' : 'OFFLINE MODE (on-device engine only)';
  console.log(`\n  🇮🇳 Bharat Setu running  →  http://localhost:${PORT}`);
  console.log(`     AI engine: ${ai}${process.env.OPENAI_BASE_URL ? '  via ' + process.env.OPENAI_BASE_URL : ''}`);
  console.log(`     Static root: ${PUBLIC}\n`);
});
