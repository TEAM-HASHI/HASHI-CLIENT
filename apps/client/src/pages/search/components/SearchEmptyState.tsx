import { Button } from '@hashi/hds-ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import emptySearchImage from '@/shared/assets/images/empty-search.svg'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

export const SearchEmptyState = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)

  const handleReservationClick = () => {
    if (isAuthenticated) {
      navigate(ROUTES.anywhereReservation)
      return
    }
    setIsAuthGateOpen(true)
  }

  return (
    <>
      <section className="flex flex-col items-center px-5 pt-37 pb-8 text-center">
        <div className="relative h-[73.003px] w-[93.125px] shrink-0">
          <img
            alt=""
            aria-hidden="true"
            className="absolute -top-[2.848px] left-0 max-w-none"
            width={94}
            height={77}
            src={emptySearchImage}
          />
        </div>
        <h2 className="typo-header-3 text-primary-200 mt-[18.249px] leading-[1.5]">
          찾는 식당이 검색되지 않나요?
        </h2>
        <p className="typo-body-6 text-cool-gray-500 mt-3.5">
          식당명과 주소를 알려주시면
          <br />
          예약 가능 여부를 확인해 드려요.
        </p>
        <Button
          className="bg-cool-gray-900 mt-[22.811px] w-38"
          onClick={handleReservationClick}
          size="lg"
        >
          어디든 예약 요청
        </Button>
      </section>
      <AuthGateBottomSheet
        open={isAuthGateOpen}
        onOpenChange={setIsAuthGateOpen}
        onKakaoPress={() => startKakaoOAuth(ROUTES.anywhereReservation)}
      />
    </>
  )
}
