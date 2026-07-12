import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { MOCK_RESTAURANT_DETAIL } from '@/features/restaurantDetail/mocks/restaurantDetail.mock'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import {
  getRestaurantDetailPath,
  getRestaurantMenuDetailPath,
  getRestaurantMenuDetailSourceState,
  getRestaurantReservationNewPath,
  navigateBackOrReplace,
  type RestaurantMenuDetailLocationState,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { useAuthStatus } from '@/shared/hooks'

export const useRestaurantMenuDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { menuId, restaurantId } = useParams()
  const { isAuthenticated } = useAuthStatus()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const currentRestaurantId = restaurantId ?? MOCK_RESTAURANT_DETAIL.id
  const sourceState = getRestaurantMenuDetailSourceState(location.state)
  const selectedMenu = MOCK_RESTAURANT_DETAIL.menus.find(
    (menu) => menu.id === menuId,
  )
  const fallbackMenu = MOCK_RESTAURANT_DETAIL.menus[0]
  const visibleSelectedMenu = selectedMenu ?? fallbackMenu

  const otherMenus = useMemo(
    () =>
      MOCK_RESTAURANT_DETAIL.menus.filter(
        (menu) => menu.id !== visibleSelectedMenu.id,
      ),
    [visibleSelectedMenu.id],
  )
  const otherMenusForDisplay = useMemo(
    () =>
      otherMenus.map((menu, index) => ({
        ...menu,
        isRepresentative: index < 2,
      })),
    [otherMenus],
  )
  const shareUrl = getRestaurantMenuDetailPath(
    currentRestaurantId,
    visibleSelectedMenu.id,
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [menuId])

  useEffect(() => {
    if (selectedMenu || !fallbackMenu) {
      return
    }

    const nextState: RestaurantMenuDetailLocationState | undefined =
      sourceState.source ? { source: sourceState.source } : undefined

    navigate(
      getRestaurantMenuDetailPath(currentRestaurantId, fallbackMenu.id),
      {
        replace: true,
        state: nextState,
      },
    )
  }, [
    currentRestaurantId,
    fallbackMenu,
    navigate,
    selectedMenu,
    sourceState.source,
  ])

  const getReturnPath = () => {
    return sourceState.source === 'today'
      ? ROUTES.todayRestaurant
      : getRestaurantDetailPath(currentRestaurantId)
  }

  const handlePressBack = () => {
    navigateBackOrReplace(navigate, getReturnPath())
  }

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

    navigate(getRestaurantReservationNewPath(currentRestaurantId))
  }

  const handlePressMenuItem = (nextMenuId: string) => {
    const nextPath = getRestaurantMenuDetailPath(
      currentRestaurantId,
      nextMenuId,
    )

    if (!sourceState.source) {
      navigate(nextPath)
      return
    }

    navigate(nextPath, {
      state: { source: sourceState.source },
    })
  }

  const handleTabChange = (tab: RestaurantDetailTab) => {
    if (tab === 'menu') {
      return
    }

    navigate(getReturnPath(), {
      state: { activeTab: tab },
    })
  }

  return {
    currentRestaurantId,
    isAuthGateOpen,
    isComingSoonOpen,
    otherMenus,
    otherMenusForDisplay,
    restaurant: MOCK_RESTAURANT_DETAIL,
    selectedMenu: visibleSelectedMenu,
    shareUrl,
    onAuthGateOpenChange: setIsAuthGateOpen,
    onComingSoonOpenChange: setIsComingSoonOpen,
    onPressBack: handlePressBack,
    onPressLike: handlePressLike,
    onPressMenuItem: handlePressMenuItem,
    onPressReservation: handlePressReservation,
    onTabChange: handleTabChange,
  }
}
