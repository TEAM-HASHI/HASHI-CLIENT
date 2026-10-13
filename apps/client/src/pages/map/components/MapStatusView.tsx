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
    className="flex flex-col items-center justify-center py-10 text-center"
  >
    {loading ? (
      <img src={spinner} alt="" className="size-20 motion-safe:animate-spin" />
    ) : (
      <img src={errorMark} alt="" className="h-7 w-12" />
    )}
    <p
      className={loading ? 'sr-only' : 'typo-caption-1 text-warm-gray-300 mt-4'}
    >
      {message}
    </p>
    {onRetry && (
      <Button size="md" variant="neutral" className="mt-8" onClick={onRetry}>
        다시 시도하기
      </Button>
    )}
  </div>
)
