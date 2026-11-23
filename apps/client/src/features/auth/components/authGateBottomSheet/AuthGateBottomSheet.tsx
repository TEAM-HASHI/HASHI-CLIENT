import { BottomSheet } from '@hashi/hds-ui'

import loginImage from '@/shared/assets/images/login-redesign.svg'
import { KakaoStartButton } from '@/shared/components/kakaoStartButton'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

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
  const { isAuthenticated } = useAuthStatus()
  return (
    <BottomSheet
      aria-label="로그인 안내"
      className="rounded-t-[20px]"
      overlayClassName="bg-[#1d1d1d]/[0.69]"
      open={open && !isAuthenticated}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      showHandle={false}
    >
      <div className="relative h-96.75">
        <p className="absolute inset-x-1 top-[31px] text-[#000000]">
          <span className="typo-body-1 block leading-[27px] font-normal">
            간편하게 로그인하고
          </span>
          <span className="typo-header-3 block leading-[1.5]">
            일본 미식 여행을 즐겨보세요!
          </span>
        </p>
        <img
          alt=""
          aria-hidden="true"
          className="absolute top-20 left-[calc(50%-5.5px)] h-[181px] w-[244px] -translate-x-1/2"
          width={244}
          height={181}
          src={loginImage}
        />
        <KakaoStartButton
          className="absolute top-[300px] left-1/2 -translate-x-1/2 text-[#000000]"
          onPress={onKakaoPress}
        >
          카카오로 로그인하기
        </KakaoStartButton>
      </div>
    </BottomSheet>
  )
}
