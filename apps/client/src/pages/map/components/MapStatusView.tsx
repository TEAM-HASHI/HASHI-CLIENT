import { Button } from '@hashi/hds-ui'
import spinner from '@/shared/assets/images/map/loading-spinner.svg'
import errorMark from '@/shared/assets/images/map/error-mark.svg'

export const MapStatusView = ({
  message,
  loading = false,
  onRetry,
}: {
  message: string
  loading?: boolean
  onRetry?: () => void
}) => (
  <div
    role={loading ? 'status' : 'alert'}
    className="flex flex-col items-center justify-center text-center"
  >
    {loading ? (
      <img src={spinner} alt="" className="size-20 motion-safe:animate-spin" />
    ) : (
      <span className="relative h-[27.758px] w-12">
        <img
          src={errorMark}
          alt=""
          className="absolute top-0 left-0 max-w-none"
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
      >
        다시 시도하기
      </Button>
    )}
  </div>
)
