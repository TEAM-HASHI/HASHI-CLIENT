import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { App } from '@/app/App'
import { initSentry } from '@/shared/lib/sentry'
import '@/app/styles/global.css'

initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>문제가 발생했습니다.</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
