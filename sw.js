// sw.js — Travel Tracker Service Worker
// Bump CACHE_NAME any time you update the app to force a fresh cache.
const CACHE_NAME = 'travel-tracker-v3.1';

// Core app shell — cached immediately on install so the app works offline
// from the very first load.
const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap',
];

// ── Install: cache the shell immediately ─────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Exchange rate APIs — network only, never cache (data changes constantly).
    // Fail silently so the app can handle offline gracefully.
    const isRateAPI = [
        'frankfurter.app',
        'open.er-api.com',
        'exchangerate.host',
    ].some(host => url.hostname.includes(host));

    if (isRateAPI) {
        event.respondWith(
            fetch(event.request).catch(() =>
                new Response(JSON.stringify({ error: 'offline' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                })
            )
        );
        return;
    }

    // Everything else: cache-first, fall back to network and cache the result.
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }
                const toCache = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                return response;
            }).catch(() =>
                new Response('Offline — resource not cached.', { status: 503 })
            );
        })
    );
});
