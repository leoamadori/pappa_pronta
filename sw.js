/* Pappa Pronta — Offline-First Service Worker (App Shell + Tesseract.js v5 + .traineddata) */
const APP_CACHE = 'pappa-pronta-shell-v10';
const OCR_CACHE = 'pappa-pronta-ocr-v2';
const API_CACHE = 'pappa-pronta-api-v2';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

const OCR_PRECACHE_URLS = [
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/tesseract-core-simd-lstm.wasm.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/tesseract-core-lstm.wasm.js',
  'https://tessdata.projectnaptha.com/4.0.0/ita.traineddata.gz',
  'https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz'
];

function isOcrAsset(url) {
  return (
    url.includes('tesseract') ||
    url.includes('.traineddata') ||
    url.includes('projectnaptha.com') ||
    url.includes('.wasm')
  );
}

function isOpenFoodFacts(url) {
  return url.includes('openfoodfacts.org');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(APP_CACHE);
      await shellCache.addAll(CORE_ASSETS);
      // Pre-warm lightweight Tesseract main scripts non-blockingly
      caches.open(OCR_CACHE).then((ocrCache) => {
        OCR_PRECACHE_URLS.slice(0, 2).forEach((u) => {
          fetch(u, { mode: 'cors' })
            .then((res) => {
              if (res && res.ok) ocrCache.put(u, res);
            })
            .catch(() => {});
        });
      });
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const validCaches = new Set([APP_CACHE, OCR_CACHE, API_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (!validCaches.has(key) ? caches.delete(key) : Promise.resolve()))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'PRECACHE_OCR') {
    event.waitUntil(
      (async () => {
        const ocrCache = await caches.open(OCR_CACHE);
        let cachedCount = 0;
        for (const url of OCR_PRECACHE_URLS) {
          try {
            const existing = await ocrCache.match(url);
            if (existing) {
              cachedCount++;
              continue;
            }
            const res = await fetch(url, { mode: 'cors' });
            if (res && res.ok) {
              await ocrCache.put(url, res);
              cachedCount++;
            }
          } catch (_) {
            // Ignore offline errors safely
          }
        }
        const allReady = cachedCount === OCR_PRECACHE_URLS.length;
        if (event.source) {
          event.source.postMessage({
            type: 'OCR_CACHE_STATUS',
            ready: allReady,
            cachedCount,
            total: OCR_PRECACHE_URLS.length
          });
        }
      })()
    );
  } else if (data.type === 'CHECK_OCR_CACHE') {
    event.waitUntil(
      (async () => {
        const ocrCache = await caches.open(OCR_CACHE);
        let cachedCount = 0;
        for (const url of OCR_PRECACHE_URLS) {
          if (await ocrCache.match(url)) cachedCount++;
        }
        if (event.source) {
          event.source.postMessage({
            type: 'OCR_CACHE_STATUS',
            ready: cachedCount === OCR_PRECACHE_URLS.length,
            cachedCount,
            total: OCR_PRECACHE_URLS.length
          });
        }
      })()
    );
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;

  // Allow Firebase Auth, Firestore RPCs & Google Identity endpoints to pass directly to network
  if (
    url.includes('googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('accounts.google.com') ||
    url.includes('firebaseapp.com/__/')
  ) {
    return;
  }

  // 1. Tesseract.js v5, WASM cores & .traineddata(.gz) -> Cache-First for supermarket offline reliability
  if (isOcrAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(OCR_CACHE);
        const cached = await cache.match(req, { ignoreVary: true });
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh && (fresh.ok || fresh.type === 'opaque')) {
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch (_) {
          return new Response('', { status: 503, statusText: 'Offline OCR Asset Unavailable' });
        }
      })()
    );
    return;
  }

  // 2. Open Food Facts EAN lookup -> Network-First with API cache & clean JSON fallback
  if (isOpenFoodFacts(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) {
            cache.put(req, fresh.clone());
          }
          return fresh;
        } catch (_) {
          const cached = await cache.match(req);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ status: 0, offline: true, status_verbose: 'offline' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      })()
    );
    return;
  }

  // 3. App Shell: Network-First for HTML navigation (instant updates), Stale-While-Revalidate for static icons/manifest
  event.respondWith(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      const isHtmlNav = req.mode === 'navigate' || url.endsWith('/index.html');
      if (isHtmlNav) {
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) {
            cache.put('./index.html', fresh.clone());
            cache.put(req, fresh.clone());
            return fresh;
          }
        } catch (_) {}
        const cachedNav = (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html'));
        if (cachedNav) return cachedNav;
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }

      const cached = await cache.match(req);
      const networkFetch = fetch(req)
        .then((fresh) => {
          if (fresh && fresh.ok && new URL(url).origin === self.location.origin) {
            cache.put(req, fresh.clone());
          }
          return fresh;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkFetch);
        return cached;
      }

      const fresh = await networkFetch;
      if (fresh) return fresh;
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })()
  );
});
