import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { useRestaurantReviewWriteNavigation } from '@/features/restaurantDetail/hooks/useRestaurantReviewWriteNavigation'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import {
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
} from '@/app/router/routePaths'
import type { RestaurantMenuDetailSource } from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { useAuthStatus } from '@/shared/hooks'
import { getCollectionSaveState } from '@/features/collection/utils/collectionNavigation'

interface UseRestaurantDetailActionsParams {
  menuDetailSource: RestaurantMenuDetailSource
  restaurantId: string
  activeTab: RestaurantDetailTab
  onReviewUnavailable: () => void
}

export const useRestaurantDetailActions = ({
  menuDetailSource,
  restaurantId,
  activeTab,
  onReviewUnavailable,
}: UseRestaurantDetailActionsParams) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const { onPressWriteReview } = useRestaurantReviewWriteNavigation({
    isAuthenticated,
    onAuthRequired: () => setIsAuthGateOpen(true),
    onReviewUnavailable,
    restaurantId: Number(restaurantId),
  })

  const handlePressLike = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionSaveState(
          { ...location.state, restaurantId: Number(restaurantId), activeTab },
          restaurantId,
        ),
      },
    )
  }

  const handlePressReservation = () => {
    if (!isAuthenticated) {
      setIsAuthGateOpen(true)
      return
    }

    navigate(getRestaurantReservationNewPath(restaurantId))
  }

  const handlePressMenuItem = (menuId: string) => {
    if (menuDetailSource === 'today') {
      navigate(getPathFromLocation(location), {
        replace: true,
        state: { ...location.state, restaurantId: Number(restaurantId) },
      })
    }
    navigate(getRestaurantMenuDetailPath(restaurantId, menuId), {
      state: { source: menuDetailSource },
    })
  }

  const handlePressKakao = () => {
    startKakaoOAuth(getPathFromLocation(location))
  }

  return {
    isAuthGateOpen,
    onAuthGateOpenChange: setIsAuthGateOpen,
    onPressKakao: handlePressKakao,
    onPressLike: handlePressLike,
    onPressMenuItem: handlePressMenuItem,
    onPressReservation: handlePressReservation,
    onPressWriteReview,
  }
}
