import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AsyncErrorFallback } from '@/app/providers/AsyncErrorFallback'
import { captureError } from '@/shared/lib/sentry'

interface AsyncBoundaryProps {
  children: ReactNode
  resetKeys?: unknown[]
}

const handleBoundaryError = (error: unknown, info: ErrorInfo) => {
  captureError(error, {
    extra: { componentStack: info.componentStack },
  })
}

const AsyncBoundary = ({ children, resetKeys }: AsyncBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={AsyncErrorFallback}
          onError={handleBoundaryError}
          onReset={reset}
          resetKeys={resetKeys}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default AsyncBoundary
