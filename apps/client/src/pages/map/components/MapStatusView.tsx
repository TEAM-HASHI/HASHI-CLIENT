import { LoadErrorIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import spinner from '@/shared/assets/images/map/loading-spinner.svg'

export const MapStatusView = ({
  message,
  loading = false,
  onRetry,
  retryDisabled,
}: {
  message: string
  loading?: boolean
  onRetry?: () => void
  retryDisabled?: boolean
}) => (
  <div
    role={loading ? 'status' : 'alert'}
    className="flex flex-col items-center justify-center text-center"
  >
    {loading ? (
      <img src={spinner} alt="" className="size-20 motion-safe:animate-spin" />
    ) : (
      <span className="relative h-[27.758px] w-12">
        <LoadErrorIcon
          aria-hidden="true"
          className="text-warm-gray-300 absolute top-0 left-0 max-w-none"
          height={29.2938}
          width={48}
        />
      </span>
    )}
    <p
      className={
        loading
          ? 'sr-only'
          : 'typo-caption-1 text-warm-gray-300 mt-4.25 font-medium'
      }
    >
      {message}
    </p>
    {onRetry && (
      <Button
        size="md"
        variant="neutral"
        className="mt-8.5 w-24.5 px-2.5"
        onClick={onRetry}
        disabled={retryDisabled}
      >
        다시 시도하기
      </Button>
    )}
  </div>
)
