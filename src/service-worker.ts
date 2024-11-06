/// <reference lib="webworker" />

const CACHE_NAME = 'replicator-studio-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      await (self as any).skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      await (self as any).clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          return await fetch(event.request);
        } catch (error) {
          // Network failed, try cache
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page
          return cache.match(OFFLINE_URL) as Promise<Response>;
        }
      })()
    );
  }

  // Cache-first for static assets
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' ||
      event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});