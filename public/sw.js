const CACHE_NAME = 'caminho-diario-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache failed:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Remove old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // For SPA navigations, try network first, then fall back to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Optionally cache a fresh copy of index
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', resClone));
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match('/index.html')) || (await cache.match('/'));
        })
    );
    return;
  }

  // Static/assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

// Push notification event handler
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'Caminho Diário',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] Push data:', data);
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || {},
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  console.log('[SW] Showing notification:', notificationData.title);

  // ALWAYS show notification in system tray, regardless of app state
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
      // Additional options for better Android support
      silent: false,
      renotify: true,
      timestamp: Date.now()
    }).then(() => {
      console.log('[SW] Notification shown successfully');
      // Post message to all clients AFTER showing notification
      return clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clientList => {
        clientList.forEach(client => {
          client.postMessage({
            type: 'PUSH_RECEIVED',
            data: notificationData,
            timestamp: new Date().toISOString()
          });
        });
      });
    }).catch(err => {
      console.error('[SW] Error showing notification:', err);
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.notification);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  
  console.log('[SW] Opening URL:', fullUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window/tab open with this URL
        for (let client of windowClients) {
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(fullUrl);
          
          // Compare pathname to see if it's the same route
          if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
            console.log('[SW] Focusing existing client');
            return client.focus();
          }
        }
        
        // Check if there's any window open that we can navigate
        if (windowClients.length > 0 && 'navigate' in windowClients[0]) {
          console.log('[SW] Navigating existing client');
          return windowClients[0].focus().then(client => client.navigate(fullUrl));
        }
        
        // If not, open a new window
        if (clients.openWindow) {
          console.log('[SW] Opening new window');
          return clients.openWindow(fullUrl);
        }
      })
      .catch(err => {
        console.error('[SW] Error handling notification click:', err);
      })
  );
});
