import { KakaoStartButton } from '@/shared/components/kakaoStartButton'
import loginRequiredImage from '@/shared/assets/images/login-required.webp'

export const LoginRequiredPage = () => {
  return (
    <section className="app-mobile-bottom-nav-content flex flex-col items-center justify-center px-5 text-center">
      <img
        alt=""
        aria-hidden="true"
        className="mb-2.25 h-auto w-20.75"
        src={loginRequiredImage}
      />
      <h1 className="typo-header-1 mb-5.75 text-black">
        Hashi와 함께
        <br />
        예약을 시작해보세요!
      </h1>
      <p className="typo-body-2 text-cool-gray-500 mb-10">
        로그인하면 예약 현황을
        <br />
        한눈에 확인할 수 있어요.
      </p>
      <KakaoStartButton
        className="w-85"
        onPress={() => {
          // TODO: 카카오 OAuth 플로우 연결
        }}
      >
        카카오로 1초 만에 시작하기
      </KakaoStartButton>
    </section>
  )
}
