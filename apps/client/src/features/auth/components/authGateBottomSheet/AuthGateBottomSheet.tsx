import { PopularIcon } from '@hashi/hds-icons'
import { BottomSheet } from '@hashi/hds-ui'

import { KakaoStartButton } from '@/features/auth/components/authGateBottomSheet/KakaoStartButton'

type AuthGateBottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKakaoPress: () => void
}

export const AuthGateBottomSheet = ({
  open,
  onOpenChange,
  onKakaoPress,
}: AuthGateBottomSheetProps) => {
  return (
    <BottomSheet
      aria-label="로그인 안내"
      className="rounded-t-[20px]"
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      showHandle={false}
    >
      <div className="pb-[54px]">
        <p className="typo-header-3 mt-[23px] text-black">
          <span className="block leading-[1.45] font-normal">
            간편하게 로그인하고
          </span>
          <span className="block leading-[1.45]">
            Hashi와 일본 미식 여행을 완성해보세요!
          </span>
        </p>
        <div className="flex justify-center pt-[73px] pb-[42px]">
          <PopularIcon aria-hidden="true" className="size-[172px]" />
        </div>
        <KakaoStartButton onPress={onKakaoPress}>
          카카오로 1초 만에 시작하기
        </KakaoStartButton>
      </div>
    </BottomSheet>
  )
}
