import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getRestaurantDetailPath,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
} from '@/app/router/routePaths'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import type { RestaurantMenuListData } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { useRestaurantPhotos } from '@/features/restaurantDetail/hooks/useRestaurantPhotos'
import { useRestaurantSaveSummary } from '@/features/restaurantDetail/hooks/useRestaurantSaveSummary'
import {
  restaurantMenuQueryOptions,
  restaurantMenusInfiniteQueryOptions,
  restaurantSummaryQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import {
  createRestaurantMenusViewModel,
  createRestaurantMenuViewModel,
} from '@/features/restaurantDetail/utils/createRestaurantDetailViewModel'
import {
  getRestaurantMenuDetailSourceState,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { checkIsNotFoundError } from '@/shared/api'
import { useAuthStatus, useInfiniteScrollTrigger } from '@/shared/hooks'

const MENU_DETAIL_OTHER_MENU_PAGE_SIZE = 10

const parsePositiveIntegerParam = (param: string | undefined) => {
  const parsedParam = Number(param)

  return Number.isSafeInteger(parsedParam) && parsedParam > 0
    ? parsedParam
    : null
}

export const useRestaurantMenuDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { menuId, restaurantId } = useParams()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)
  const parsedRestaurantId = parsePositiveIntegerParam(restaurantId)
  const parsedMenuId = parsePositiveIntegerParam(menuId)
  const hasValidParams = parsedRestaurantId !== null && parsedMenuId !== null
  const saves = useRestaurantSaveSummary(
    hasValidParams ? parsedRestaurantId : 0,
  )
  const photos = useRestaurantPhotos(
    hasValidParams ? parsedRestaurantId : 0,
    false,
  )
  const currentRestaurantId = String(parsedRestaurantId ?? '')
  const currentMenuId = String(parsedMenuId ?? '')
  const sourceState = getRestaurantMenuDetailSourceState(location.state)
  const summaryQuery = useQuery({
    ...restaurantSummaryQueryOptions(parsedRestaurantId ?? 0),
    enabled: hasValidParams,
  })
  const menuQuery = useQuery({
    ...restaurantMenuQueryOptions(parsedRestaurantId ?? 0, parsedMenuId ?? 0),
    enabled: hasValidParams,
  })
  const menusQuery = useInfiniteQuery({
    ...restaurantMenusInfiniteQueryOptions(
      parsedRestaurantId ?? 0,
      MENU_DETAIL_OTHER_MENU_PAGE_SIZE,
      parsedMenuId ?? undefined,
    ),
    enabled: hasValidParams,
  })
  const canFetchNextOtherMenuPage =
    menusQuery.hasNextPage && !menusQuery.isFetching && !menusQuery.isError
  const { fetchNextPage: fetchNextOtherMenuPage } = menusQuery
  const handleIntersectOtherMenu = useCallback(() => {
    if (canFetchNextOtherMenuPage) {
      return fetchNextOtherMenuPage()
    }
  }, [canFetchNextOtherMenuPage, fetchNextOtherMenuPage])
  const otherMenuLoadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: canFetchNextOtherMenuPage,
    isLoading: menusQuery.isFetchingNextPage,
    onIntersect: handleIntersectOtherMenu,
  })
  const selectedMenu = createRestaurantMenuViewModel(menuQuery.data ?? null)
  const menus = useMemo(
    () =>
      menusQuery.data?.pages.flatMap((page: RestaurantMenuListData) =>
        createRestaurantMenusViewModel(page.menus),
      ) ?? [],
    [menusQuery.data?.pages],
  )

  const otherMenuTotalCount = menuQuery.data?.otherMenuCount ?? menus.length
  const shareUrl = getRestaurantMenuDetailPath(
    currentRestaurantId,
    currentMenuId,
  )
  const requestError = summaryQuery.error ?? menuQuery.error
  const isNotFound =
    !hasValidParams ||
    checkIsNotFoundError(requestError) ||
    (!menuQuery.isPending && selectedMenu === null)
  const isLoading = summaryQuery.isPending || menuQuery.isPending
  const restaurant = summaryQuery.data
    ? {
        name: summaryQuery.data.name,
        reviewCount: summaryQuery.data.reviewCount ?? 0,
      }
    : null

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [menuId])

  const getReturnPath = () => {
    return sourceState.source === 'today'
      ? ROUTES.todayRestaurant
      : getRestaurantDetailPath(currentRestaurantId)
  }

  const handlePressBack = () => {
    if (sourceState.source === 'map') {
      navigate(ROUTES.map, {
        replace: true,
        state: { mapRestaurantId: currentRestaurantId, activeTab: 'menu' },
      })
      return
    }
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
      ...(sourceState.source === 'map' ? { replace: true } : {}),
      state: { source: sourceState.source },
    })
  }

  const handleTabChange = (tab: RestaurantDetailTab) => {
    if (tab === 'menu') {
      return
    }

    if (sourceState.source === 'map') {
      navigate(ROUTES.map, {
        replace: true,
        state: { mapRestaurantId: currentRestaurantId, activeTab: tab },
      })
      return
    }

    navigate(getReturnPath(), {
      state: { activeTab: tab },
    })
  }

  return {
    error: requestError,
    isAuthGateOpen,
    isComingSoonOpen,
    isLoading,
    isNotFound,
    hasMoreOtherMenus: menusQuery.hasNextPage,
    isOtherMenusError: menusQuery.isError && !menusQuery.data,
    isOtherMenusLoading: menusQuery.isPending,
    isOtherMenusNextPageError: menusQuery.isFetchNextPageError,
    onRetryOtherMenus: () =>
      menusQuery.isFetchNextPageError
        ? menusQuery.fetchNextPage()
        : menusQuery.refetch(),
    saveCount: saves.saveCount,
    saved: saves.saved,
    otherMenus: menus,
    otherMenuLoadMoreRef,
    otherMenuTotalCount,
    photoCount: photos.enabled ? photos.counts?.all : undefined,
    restaurant,
    selectedMenu,
    shareUrl,
    onAuthGateOpenChange: setIsAuthGateOpen,
    onComingSoonOpenChange: setIsComingSoonOpen,
    onPressBack: handlePressBack,
    onPressKakao: () => startKakaoOAuth(getPathFromLocation(location)),
    onPressLike: handlePressLike,
    onPressMenuItem: handlePressMenuItem,
    onPressReservation: handlePressReservation,
    onTabChange: handleTabChange,
  }
}
