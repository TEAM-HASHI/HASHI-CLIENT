import { useLocation } from 'react-router-dom'

import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getRedirectToFromLocationState } from '@/features/auth/utils/authRedirect'
import emptyImage from '@/shared/assets/images/empty.webp'
import { KakaoStartButton } from '@/shared/components/kakaoStartButton'

export const LoginRequiredPage = () => {
  const location = useLocation()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const redirectTo = getRedirectToFromLocationState(location.state)

  return (
    <section className="app-mobile-bottom-nav-content flex flex-col items-center justify-center px-5 text-center">
      <div className="flex translate-y-[42px] flex-col items-center">
        <img
          alt=""
          aria-hidden="true"
          className="mb-7 h-19 w-25.25"
          src={emptyImage}
        />
        <h1 className="typo-sub-header-1 text-cool-gray-900 mb-3 whitespace-nowrap">
          Hashi와 함께 예약을 시작해보세요!
        </h1>
        <p className="typo-body-8 text-cool-gray-500 mb-5 leading-[1.2]">
          더 편한 Hashi 이용을 위해
          <br />
          현재 기능을 준비하고 있어요.
        </p>
        <KakaoStartButton
          onPress={() => {
            startKakaoOAuth(redirectTo)
          }}
        >
          카카오로 로그인하기
        </KakaoStartButton>
      </div>
    </section>
  )
}
