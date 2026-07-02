import { useState } from 'react'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useAuthStatus } from '@/shared/hooks'

export const HomePage = () => {
  const { isAuthenticated } = useAuthStatus()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(!isAuthenticated)

  return (
    <>
      <h1>홈 페이지</h1>
      <AuthGateBottomSheet
        open={!isAuthenticated && isAuthGateOpen}
        onKakaoPress={() => {
          // TODO: connect Kakao OAuth flow.
        }}
        onOpenChange={setIsAuthGateOpen}
      />
    </>
  )
}
