import * as Sentry from '@sentry/react'

import { checkHasHttpStatus } from '@/shared/api/apiError'

export const checkShouldCaptureError = (error: unknown) => {
  if (checkHasHttpStatus(error)) {
    return error.status === 405 || error.status >= 500
  }

  return true
}

export const captureError = (error: unknown) => {
  if (!checkShouldCaptureError(error)) {
    return
  }

  Sentry.captureException(error)
}

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_VERCEL_ENV,
    release: import.meta.env.VITE_APP_VERSION,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  })
}
