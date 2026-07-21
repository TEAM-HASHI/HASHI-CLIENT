import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/app/styles/global.css'

const removeLegacyPwaState = async () => {
  const unregisterWorkers =
    'serviceWorker' in navigator
      ? navigator.serviceWorker
          .getRegistrations()
          .then((registrations) =>
            Promise.all(
              registrations.map((registration) => registration.unregister()),
            ),
          )
      : Promise.resolve([])
  const deleteCaches =
    'caches' in globalThis
      ? globalThis.caches
          .keys()
          .then((cacheNames) =>
            Promise.all(
              cacheNames.map((cacheName) =>
                globalThis.caches.delete(cacheName),
              ),
            ),
          )
      : Promise.resolve([])

  await Promise.all([unregisterWorkers, deleteCaches])
}

void removeLegacyPwaState().catch(() => undefined)

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element is missing.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
