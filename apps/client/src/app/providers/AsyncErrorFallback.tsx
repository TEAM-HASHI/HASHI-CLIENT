import { Button } from '@hashi/hds-ui'
import type { FallbackProps } from 'react-error-boundary'

import { getErrorPresentation } from '@/shared/api/errorPresentation'

export const AsyncErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const { code, message } = getErrorPresentation(error)

  return (
    <section
      className="flex min-h-dvh flex-col items-center justify-center px-5 text-center"
      role="alert"
    >
      {code ? (
        <p className="typo-caption-1 text-cool-gray-500 mb-2">{code}</p>
      ) : null}
      <p className="typo-header-3 text-primary-200 whitespace-pre-line">
        {message}
      </p>
      <Button
        className="mt-6 w-59.25"
        onClick={resetErrorBoundary}
        size="md"
        type="button"
      >
        다시 시도
      </Button>
    </section>
  )
}
