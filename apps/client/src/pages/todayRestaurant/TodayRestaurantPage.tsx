import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { RestaurantDetailTemplate } from '@/features/restaurantDetail'
import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { useRestaurantDetailActions } from '@/features/restaurantDetail/hooks/useRestaurantDetailActions'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { randomRestaurantRecommendationQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailTabState,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { NotFoundPage } from '@/pages/notFound'
import { checkIsNotFoundError } from '@/shared/api'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const TODAY_RESTAURANT_MENU_PAGE_SIZE = 10

export const TodayRestaurantPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab
  const [recommendedSummary, setRecommendedSummary] =
    useState<RestaurantSummary | null>(null)

  const randomRecommendationQuery = useQuery(
    randomRestaurantRecommendationQueryOptions(),
  )
  const summary = recommendedSummary ?? randomRecommendationQuery.data
  const restaurantId = summary?.restaurantId ?? 0
  const hasRestaurantId = restaurantId > 0
  const detailContent = useRestaurantDetailContent({
    enabled: hasRestaurantId,
    initialTab: initialTab ?? undefined,
    menuPageSize: TODAY_RESTAURANT_MENU_PAGE_SIZE,
    restaurantId,
    summary,
  })
  const detailActions = useRestaurantDetailActions({
    menuDetailSource: 'today',
    restaurantId: String(restaurantId),
    onReviewUnavailable: detailContent.onOpenReviewUnavailableModal,
  })
  const recommendAgainMutation = useMutation({
    mutationFn: ({
      excludeRestaurantId,
    }: {
      excludeRestaurantId?: number
      fromPhotoTab: boolean
    }) =>
      getRandomRestaurantRecommendation(
        excludeRestaurantId === undefined ? undefined : { excludeRestaurantId },
      ),
    onSuccess: (nextSummary) => {
      setRecommendedSummary(nextSummary)
      detailContent.resetDetailState(
        detailContent.activeTab === 'photo' ? 'photo' : 'info',
      )
    },
  })
  const requestError =
    randomRecommendationQuery.error ??
    (recommendAgainMutation.variables?.fromPhotoTab
      ? null
      : recommendAgainMutation.error) ??
    detailContent.error

  if (requestError) {
    if (checkIsNotFoundError(requestError)) {
      return <NotFoundPage />
    }

    throw requestError
  }

  if (
    randomRecommendationQuery.isPending ||
    !summary ||
    detailContent.isLoading ||
    !detailContent.restaurant
  ) {
    return <LoadingScreen />
  }

  const { restaurant } = detailContent

  const handlePressBack = () => {
    navigateBackOrReplace(navigate, ROUTES.home)
  }

  const handlePressRecommendAgain = () => {
    if (recommendAgainMutation.isPending) {
      return
    }

    recommendAgainMutation.mutate({
      excludeRestaurantId: restaurant.id ? Number(restaurant.id) : undefined,
      fromPhotoTab: detailContent.activeTab === 'photo',
    })
  }

  return (
    <RestaurantDetailTemplate
      content={{ ...detailContent, restaurant }}
      actions={detailActions}
      onPressBack={handlePressBack}
      onPressRecommendAgain={handlePressRecommendAgain}
      shareUrl={ROUTES.todayRestaurant}
      shouldScrollToInitialTab={
        initialTab !== undefined && initialTab !== 'info'
      }
      title="오늘의 식당"
      variant="today"
    />
  )
}
