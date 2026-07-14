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
      <div className="relative h-[387px]" data-testid="auth-gate-content">
        <p className="absolute top-[33px] left-[5px] w-[344px] text-black">
          <span className="typo-body-1 block leading-[29px] font-normal">
            간편하게 로그인하고
          </span>
          <span className="typo-header-3 block leading-[1.5]">
            Hashi와 일본 미식 여행을 완성해보세요!
          </span>
        </p>
        <img
          alt=""
          aria-hidden="true"
          className="absolute top-[114px] left-[72px] h-[172px] w-[201px]"
          src={loginImage}
        />
        <KakaoStartButton
          className="absolute top-[311px] left-1/2 -translate-x-1/2"
          onPress={onKakaoPress}
        >
          카카오로 로그인하기
        </KakaoStartButton>
      </div>
    </BottomSheet>
  )
}
