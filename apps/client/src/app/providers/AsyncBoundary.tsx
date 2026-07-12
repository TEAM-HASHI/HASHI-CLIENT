import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AsyncErrorFallback } from '@/app/providers/AsyncErrorFallback'
import { captureError } from '@/shared/lib/sentry'

interface AsyncBoundaryProps {
  children: ReactNode
}

const handleBoundaryError = (error: unknown, info: ErrorInfo) => {
  captureError(error, {
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
