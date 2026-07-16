
// Service Worker for ADA APP PWA - v5.3
const CACHE_NAME = 'ada-app-v5.3';
const RUNTIME_CACHE = 'ada-runtime-v5.3';
const IMAGE_CACHE = 'ada-images-v5.3';

// Assets to cache on install.
// IMPORTANTE: NÃO pré-cachear rotas HTML (/dashboard, /agenda, ...). O HTML
// referencia chunks JS com hash do build; servir HTML antigo em cache após um
// novo deploy referencia chunks que não existem mais e derruba o app com
// "client-side exception". Apenas a página offline é pré-cacheada.
const STATIC_ASSETS = [
  '/offline',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v4.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.error('[SW] Failed to cache:', err);
          // Continue even if some assets fail
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v4.0...');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip API requests from caching (always fetch fresh)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Você está offline. Esta ação requer conexão com a internet.' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Requisições RSC do Next.js (navegação client-side no App Router).
  // NUNCA servir de cache-first: um payload RSC antigo quebra a hidratação
  // após um novo deploy. Busca da rede COM bypass do cache do navegador
  // (reload) — senão o HTTP cache "immutable" antigo devolve conteúdo velho.
  if (request.headers.get('RSC') === '1' || url.search.includes('_rsc=')) {
    event.respondWith(fetch(request, { cache: 'reload' }));
    return;
  }

  // Assets estáticos com hash (imutáveis) — cache-first é seguro
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // Handle images separately
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
    return;
  }

  // Demais requisições dinâmicas — network-first (nunca cache-first, para não
  // servir conteúdo obsoleto que quebra o app após deploy)
  event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
});

// Cache first strategy (good for static assets)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Return cached version and update cache in background
      fetchAndCache(request, cacheName);
      return cached;
    }
    
    // Not in cache, fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    
    // Try to return offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/offline') || new Response('Offline');
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Network first strategy (good for dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    // `cache: 'reload'` ignora o cache HTTP do navegador e vai direto à rede.
    // Necessário porque instalações antigas guardaram o HTML como "immutable"
    // por 1 ano — sem isso, o app só mostrava versão nova com refresh manual.
    const response = await fetch(request, { cache: 'reload' });

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Network first strategy failed:', error);
    
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/offline') || new Response('Offline');
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Helper function to fetch and cache in background
function fetchAndCache(request, cacheName) {
  fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, response);
        });
      }
    })
    .catch(() => {
      // Silently fail background updates
    });
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

async function syncAppointments() {
  try {
    console.log('[SW] Syncing appointments...');
    // Logic to sync offline appointments data
    // This would typically fetch from IndexedDB and POST to server
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Failed to sync appointments:', error);
    throw error;
  }
}

async function syncExpenses() {
  try {
    console.log('[SW] Syncing expenses...');
    // Logic to sync offline expenses data
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Failed to sync expenses:', error);
    throw error;
  }
}

// Push notifications support
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do ADA APP',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'ada-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ADA APP', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message events from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');
