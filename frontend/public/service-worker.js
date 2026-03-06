/* =============================================
   Azaria PWA - Service Worker
   Cache-first para assets, Network-first para API
   ============================================= */

const CACHE_NAME = 'azaria-v2';
const API_CACHE = 'azaria-api-v1';

// Assets estáticos para pre-cachear (App Shell)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg'
];

// Instalar: pre-cachear App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: estrategia según tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear POST, ni extensiones de navegador
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // API calls: Network-first con fallback a cache
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Assets estáticos (JS, CSS, imágenes): Cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Navegación (HTML): Network-first para SPA
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Todo lo demás: Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
});

// === Estrategias de cache ===

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Si es navegación, devolver index.html para SPA routing
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }

    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// === Helpers ===

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)(\?.*)?$/i.test(pathname);
}
