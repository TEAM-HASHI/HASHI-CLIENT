import { LoadErrorIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

interface NotificationLoadErrorProps {
  onRetry: () => void
  className?: string
}

export const NotificationLoadError = ({
  onRetry,
  className,
}: NotificationLoadErrorProps) => (
  <div
    className={cn('flex flex-col items-center gap-3.75 text-center', className)}
  >
    <div className="flex flex-col items-center gap-2.5" role="alert">
      <div className="flex h-11.5 items-center justify-center">
        <LoadErrorIcon
          aria-hidden="true"
          className="text-warm-gray-300 h-auto w-12"
          height={29.2938}
          width={48}
        />
      </div>
      <p className="typo-caption-1 text-warm-gray-300 font-medium">
        정보를 불러오는 중 문제가 발생했어요.
      </p>
    </div>
    <Button className="px-3" onClick={onRetry} size="md" variant="neutral">
      다시 시도하기
    </Button>
  </div>
)
