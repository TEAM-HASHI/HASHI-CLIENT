import * as Sentry from '@sentry/react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AsyncErrorFallback } from '@/app/providers/AsyncErrorFallback'

interface AsyncBoundaryProps {
  children: ReactNode
}

const handleBoundaryError = (error: unknown, info: ErrorInfo) => {
  Sentry.captureException(error, {
    extra: { componentStack: info.componentStack },
  })
}

const AsyncBoundary = ({ children }: AsyncBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={AsyncErrorFallback}
          onError={handleBoundaryError}
          onReset={reset}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default AsyncBoundary
