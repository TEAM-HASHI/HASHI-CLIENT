import type { ReactNode } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

interface AsyncBoundaryProps {
  children: ReactNode
}

const AsyncBoundary = ({ children }: AsyncBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <section>
              <p>일시적인 오류가 발생했습니다.</p>
              <button type="button" onClick={resetErrorBoundary}>
                다시 시도
              </button>
            </section>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default AsyncBoundary
