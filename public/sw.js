/* Bharat Setu service worker — offline-first shell so the app works without network. */
const CACHE = 'bharat-setu-v3';
const SHELL = [
  '/', '/index.html', '/manifest.webmanifest',
  '/static/app.css', '/static/app.js', '/static/schemes.js',
  '/static/i18n.js', '/static/engine.js', '/static/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;          // leave CDNs/APIs alone
  if (url.pathname.startsWith('/api/')) return;         // never cache AI calls

  // Navigations: network first, fall back to cached shell (offline support)
  if (request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const c = await caches.open(CACHE);
        c.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        const c = await caches.open(CACHE);
        return (await c.match('/index.html')) || (await c.match('/')) || Response.error();
      }
    })());
    return;
  }

  // Static assets: cache first, refresh in background
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(request);
    if (hit) {
      fetch(request).then(r => { if (r && r.ok) c.put(request, r.clone()); }).catch(() => {});
      return hit;
    }
    try {
      const r = await fetch(request);
      if (r && r.ok) c.put(request, r.clone());
      return r;
    } catch {
      return hit || Response.error();
    }
  })());
});
