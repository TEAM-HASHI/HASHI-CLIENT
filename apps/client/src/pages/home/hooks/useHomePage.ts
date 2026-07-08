import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useAuthStatus } from '@/shared/hooks'

import {
  mockHomeBanners,
  mockHotSnsRestaurants,
  mockQuickLinks,
} from '@/pages/home/mocks/homeContent.mock'

const HOME_AUTH_GATE_SESSION_KEY = 'hashi:home-auth-gate-shown'

const getShouldOpenAuthGate = (isAuthenticated: boolean) => {
  if (isAuthenticated || typeof window === 'undefined') {
    return false
  }

  try {
    return window.sessionStorage.getItem(HOME_AUTH_GATE_SESSION_KEY) !== 'true'
  } catch {
    return true
  }
}

const markAuthGateShown = () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(HOME_AUTH_GATE_SESSION_KEY, 'true')
  } catch {
    // Ignore storage failures and keep the current in-memory open state.
  }
}

const getRestaurantDetailPath = (restaurantId: string) => {
  return ROUTES.restaurantDetail.replace(
    ':restaurantId',
    encodeURIComponent(restaurantId),
  )
}

export const useHomePage = () => {
  const { isAuthenticated } = useAuthStatus()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(() =>
    getShouldOpenAuthGate(isAuthenticated),
  )
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated && isAuthGateOpen) {
      markAuthGateShown()
    }
  }, [isAuthenticated, isAuthGateOpen])

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
