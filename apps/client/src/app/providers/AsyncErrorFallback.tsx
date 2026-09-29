import { Button } from '@hashi/hds-ui'
import type { FallbackProps } from 'react-error-boundary'

import { RouteChunkLoadError } from '@/app/router/routeLoadingPolicy'
import { getErrorPresentation } from '@/shared/api/errorPresentation'

export const AsyncErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const isRouteChunkLoadError = error instanceof RouteChunkLoadError
  const { code, message } = getErrorPresentation(error)
  const errorCode = isRouteChunkLoadError ? undefined : code
  const errorMessage = isRouteChunkLoadError
    ? '페이지를 불러오지 못했습니다.\n다시 시도하면 페이지를 새로고침합니다.'
    : message

  const handleRetry = () => {
    if (isRouteChunkLoadError) {
      window.location.reload()
      return
    }

    resetErrorBoundary()
  }

  return (
    <section
      className="flex min-h-dvh flex-col items-center justify-center px-5 text-center"
      role="alert"
    >
      {errorCode ? (
        <p className="typo-caption-1 text-cool-gray-500 mb-2">{errorCode}</p>
      ) : null}
      <p className="typo-header-3 text-primary-200 whitespace-pre-line">
        {errorMessage}
      </p>
      <Button
        className="mt-6 w-59.25"
        onClick={handleRetry}
        size="md"
        type="button"
      >
        다시 시도
      </Button>
    </section>
  )
}
