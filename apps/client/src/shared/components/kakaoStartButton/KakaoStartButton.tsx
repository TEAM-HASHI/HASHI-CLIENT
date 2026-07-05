import { KakaoIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

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
      className="typo-sub-header-1 bg-point-200 relative h-14.5 w-85 rounded-full text-black"
      leftIcon={
        <KakaoIcon className="absolute top-1/2 left-4.75 size-6 -translate-y-1/2" />
      }
      onClick={onPress}
    >
      {children}
    </Button>
  )
}
