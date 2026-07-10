import { BottomSheet } from '@hashi/hds-ui'

import loginImage from '@/shared/assets/images/login.webp'
import { KakaoStartButton } from '@/shared/components/kakaoStartButton'

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
      <div className="pb-4.5">
        <p className="mt-5.5 text-black">
          <span className="typo-body-1 block leading-[1.45] font-normal">
            간편하게 로그인하고
          </span>
          <span className="typo-header-3 block leading-[1.45]">
            Hashi와 일본 미식 여행을 완성해보세요!
          </span>
        </p>
        <div className="flex justify-center pt-8.75 pb-6.5">
          <img
            alt=""
            aria-hidden="true"
            width={200}
            className="h-auto"
            src={loginImage}
          />
        </div>
        <KakaoStartButton onPress={onKakaoPress}>
          카카오로 1초 만에 시작하기
        </KakaoStartButton>
      </div>
    </BottomSheet>
  )
}
