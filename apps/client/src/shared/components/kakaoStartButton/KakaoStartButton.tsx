import { KakaoIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

type KakaoStartButtonProps = {
  children: string
  onPress: () => void
  className?: string
}

export const KakaoStartButton = ({
  children,
  onPress,
  className,
}: KakaoStartButtonProps) => {
  return (
    <Button
      className={cn(
        'typo-sub-header-1 bg-point-200 enabled:active:bg-point-200 relative h-14.5 rounded-full text-black enabled:active:opacity-80',
        className,
      )}
      leftIcon={
        <KakaoIcon className="absolute top-1/2 left-4.75 size-6 -translate-y-1/2" />
      }
      onClick={onPress}
      width="full"
    >
      {children}
    </Button>
  )
}
