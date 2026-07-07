import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useAuthStatus } from '@/shared/hooks'

import {
  mockHomeBanners,
  mockHotSnsRestaurants,
  mockQuickLinks,
} from '@/pages/home/mocks/homeContent.mock'

const getRestaurantDetailPath = (restaurantId: string) => {
  return ROUTES.restaurantDetail.replace(
    ':restaurantId',
    encodeURIComponent(restaurantId),
  )
}

export const useHomePage = () => {
  const { isAuthenticated } = useAuthStatus()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(!isAuthenticated)
  const navigate = useNavigate()

  const handleAnywhereReservationPress = () => {
    navigate(ROUTES.anywhereReservation)
  }

  return {
    authGate: {
      open: !isAuthenticated && isAuthGateOpen,
      onKakaoPress: () => {
        // TODO: connect Kakao OAuth flow.
      },
      onOpenChange: setIsAuthGateOpen,
    },
    getRestaurantDetailPath,
    handleAnywhereReservationPress,
    homeBanners: mockHomeBanners,
    hotSnsRestaurants: mockHotSnsRestaurants,
    quickLinks: mockQuickLinks,
    searchPath: ROUTES.search,
  }
}
