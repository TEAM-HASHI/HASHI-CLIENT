import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/router'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'

export const App = () => {
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(true)

  return (
    <>
      <RouterProvider router={router} />
      <AuthGateBottomSheet
        open={isAuthGateOpen}
        onKakaoPress={() => {
          // TODO: 카카오 OAuth 플로우 연결
        }}
        onOpenChange={setIsAuthGateOpen}
      />
    </>
  )
}
