import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { removeRecentRestaurants } from '@/features/recentRestaurants/recentRestaurants'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getRestaurantDetailPath } from '@/app/router/routePaths'
import { RestaurantDetailTemplate } from '@/features/restaurantDetail'
import { useRestaurantDetailActions } from '@/features/restaurantDetail/hooks/useRestaurantDetailActions'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { restaurantSummaryQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailTabState,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { NotFoundPage } from '@/pages/notFound'
import { checkIsNotFoundError } from '@/shared/api'

const RESTAURANT_DETAIL_MENU_PAGE_SIZE = 10

const parseRestaurantId = (restaurantId: string | undefined) => {
  const parsedRestaurantId = Number(restaurantId)

  return Number.isSafeInteger(parsedRestaurantId) && parsedRestaurantId > 0
    ? parsedRestaurantId
    : null
}

interface RestaurantDetailContentProps {
  restaurantId: number
}

const RestaurantDetailContent = ({
  restaurantId,
}: RestaurantDetailContentProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab

  const summaryQuery = useQuery(restaurantSummaryQueryOptions(restaurantId))
  useEffect(() => {
    if (checkIsNotFoundError(summaryQuery.error))
      removeRecentRestaurants([restaurantId])
  }, [restaurantId, summaryQuery.error])
  const detailContent = useRestaurantDetailContent({
    initialTab: initialTab ?? undefined,
    menuPageSize: RESTAURANT_DETAIL_MENU_PAGE_SIZE,
    restaurantId,
    summary: summaryQuery.data,
  })
  const detailActions = useRestaurantDetailActions({
    menuDetailSource: 'detail',
    restaurantId: String(restaurantId),
    onReviewUnavailable: detailContent.onOpenReviewUnavailableModal,
  })

  const requestError = summaryQuery.error ?? detailContent.error

  if (requestError) {
    return <NotFoundPage />
  }

  if (detailContent.isLoading || !detailContent.restaurant) {
    return <LoadingScreen />
  }

  const { restaurant } = detailContent

  const handlePressBack = () => {
    navigateBackOrReplace(navigate, ROUTES.home)
  }

  return (
    <RestaurantDetailTemplate
      content={{ ...detailContent, restaurant }}
      actions={detailActions}
      onPressBack={handlePressBack}
      shareUrl={getRestaurantDetailPath(restaurant.id)}
      shouldScrollToInitialTab={
        initialTab !== undefined && initialTab !== 'info'
      }
      title="식당 상세 정보"
      variant="detail"
    />
  )
}

export const RestaurantDetailPage = () => {
  const { restaurantId } = useParams()
  const parsedRestaurantId = useMemo(
    () => parseRestaurantId(restaurantId),
    [restaurantId],
  )

  if (parsedRestaurantId === null) {
    return <NotFoundPage />
  }

  return (
    <RestaurantDetailContent
      key={parsedRestaurantId}
      restaurantId={parsedRestaurantId}
    />
  )
}
