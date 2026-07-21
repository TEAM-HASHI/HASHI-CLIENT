/* global self */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      self.caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames.map((cacheName) => self.caches.delete(cacheName)),
          ),
        ),
    ])
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) =>
        Promise.all(clients.map((client) => client.navigate(client.url))),
      ),
  )
})
