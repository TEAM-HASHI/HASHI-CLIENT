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
        'typo-sub-header-2 bg-point-200 enabled:active:bg-point-200 relative h-[42px] w-[268px] gap-3 rounded-full text-black enabled:active:opacity-80',
        className,
      )}
      leftIcon={<KakaoIcon className="h-5 w-[21px]" />}
      onClick={onPress}
    >
      {children}
    </Button>
  )
}
