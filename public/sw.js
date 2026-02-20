cat > public/sw.js << 'EOF'
// Service Worker for DebateCoach PWA
const CACHE_NAME = 'debatecoach-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache immediately
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/js/main.js',
  '/js/state.js',
  '/js/dom.js',
  '/js/flow.js',
  '/js/api.js',
  '/js/tts.js',
  '/js/recording.js',
  '/js/toast.js',
  '/js/accordion.js',
  '/js/ui.js',
  '/js/export.js',
  '/debate_logo.png',
  '/manifest.json',
  OFFLINE_URL
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        return caches.match(OFFLINE_URL);
      })
  );
});
EOF