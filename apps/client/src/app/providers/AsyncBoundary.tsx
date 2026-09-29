import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ComponentType, ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

import { AsyncErrorFallback } from '@/app/providers/AsyncErrorFallback'
import { captureError } from '@/shared/lib/sentry'

interface AsyncBoundaryProps {
  children: ReactNode
  FallbackComponent?: ComponentType<FallbackProps>
  resetKeys?: unknown[]
}

const handleBoundaryError = (error: unknown, info: ErrorInfo) => {
  captureError(error, {
    extra: { componentStack: info.componentStack },
  })
}

const AsyncBoundary = ({
  children,
  FallbackComponent = AsyncErrorFallback,
  resetKeys,
}: AsyncBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
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
