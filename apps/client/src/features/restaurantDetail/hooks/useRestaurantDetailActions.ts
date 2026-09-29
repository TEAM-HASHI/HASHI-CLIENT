import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import {
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
} from '@/app/router/routePaths'
import type { RestaurantMenuDetailSource } from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { useAuthStatus } from '@/shared/hooks'

interface UseRestaurantDetailActionsParams {
  menuDetailSource: RestaurantMenuDetailSource
  restaurantId: string
}

export const useRestaurantDetailActions = ({
  menuDetailSource,
  restaurantId,
}: UseRestaurantDetailActionsParams) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const handlePressLike = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    setIsComingSoonOpen(true)
  }

  const handlePressReservation = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    navigate(getRestaurantReservationNewPath(restaurantId))
  }

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(restaurantId, menuId), {
      state: { source: menuDetailSource },
    })
  }

  const handlePressKakao = () => {
    startKakaoOAuth(getPathFromLocation(location))
  }

  return {
    isAuthGateOpen,
    isComingSoonOpen,
    onAuthGateOpenChange: setIsAuthGateOpen,
    onComingSoonOpenChange: setIsComingSoonOpen,
    onPressKakao: handlePressKakao,
    onPressLike: handlePressLike,
    onPressMenuItem: handlePressMenuItem,
    onPressReservation: handlePressReservation,
  }
}
