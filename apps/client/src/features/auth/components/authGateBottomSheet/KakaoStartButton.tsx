import { Button } from '@hashi/hds-ui'

import { KakaoIcon } from '@/features/auth/assets/KakaoIcon'

type KakaoStartButtonProps = {
  children: string
  onPress: () => void
}

export const KakaoStartButton = ({
  children,
  onPress,
}: KakaoStartButtonProps) => {
  return (
    <Button
      className="typo-sub-header-1 bg-point-200 relative h-[58px] rounded-full text-black"
      leftIcon={
        <KakaoIcon className="absolute top-1/2 left-[19px] size-6 -translate-y-1/2" />
      }
      onClick={onPress}
      width="full"
    >
      {children}
    </Button>
  )
}
