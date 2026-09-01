import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getRestaurantDetailPath,
  getRestaurantMenuDetailPath,
  getRestaurantReservationNewPath,
} from '@/app/router/routePaths'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import { RestaurantDetailTemplate } from '@/features/restaurantDetail'
import { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import { useRestaurantReviewWriteNavigation } from '@/features/restaurantDetail/hooks/useRestaurantReviewWriteNavigation'
import { restaurantSummaryQueryOptions } from '@/features/restaurantDetail/queries/restaurantDetailQueryOptions'
import {
  getRestaurantDetailTabState,
  navigateBackOrReplace,
} from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { checkIsNotFoundError } from '@/shared/api'
import { useAuthStatus } from '@/shared/hooks'
import {
  createRestaurantDetailSeoPage,
  PageSeo,
  parseSeoPrice,
} from '@/shared/seo'
import { NotFoundPage } from '@/pages/notFound'

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
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const initialTab = getRestaurantDetailTabState(location.state).activeTab
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false)
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

  const summaryQuery = useQuery(restaurantSummaryQueryOptions(restaurantId))
  const detailContent = useRestaurantDetailContent({
    initialTab: initialTab ?? undefined,
    menuPageSize: RESTAURANT_DETAIL_MENU_PAGE_SIZE,
    restaurantId,
    summary: summaryQuery.data,
  })
  const reviewWriteNavigation = useRestaurantReviewWriteNavigation({
    isAuthenticated,
    onAuthRequired: () => setIsAuthGateOpen(true),
    onReviewUnavailable: detailContent.onOpenReviewUnavailableModal,
    restaurantId,
  })

  const requestError =
    summaryQuery.error ?? detailContent.error ?? reviewWriteNavigation.error
  const seoPage = useMemo(() => {
    const restaurant = detailContent.restaurant

    if (!restaurant) {
      return null
    }

    return createRestaurantDetailSeoPage({
      address: restaurant.address,
      businessHours: restaurant.businessHours.map(({ day, hours }) => ({
        label: day,
        value: hours,
      })),
      cuisine: summaryQuery.data?.foodCategory ?? '',
      description: restaurant.detailDescription || restaurant.summary,
      id: restaurant.id,
      images: restaurant.heroImages,
      menus: detailContent.seoMenus.map((menu) => {
        return {
          currency: menu.priceCurrency,
          description: menu.description,
          id: menu.id,
          image: menu.imageUrl,
          name: menu.name,
          price: parseSeoPrice(menu.price),
        }
      }),
      name: restaurant.name,
      priceRange:
        restaurant.priceRange === '가격 정보 없음'
          ? undefined
          : restaurant.priceRange,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
    })
  }, [detailContent.restaurant, detailContent.seoMenus, summaryQuery.data])

  if (requestError) {
    if (checkIsNotFoundError(requestError)) {
      return <NotFoundPage />
    }

    throw requestError
  }

  if (detailContent.isLoading || !detailContent.restaurant) {
    return <LoadingScreen />
  }

  const { restaurant } = detailContent

  const handlePressBack = () => {
    navigateBackOrReplace(navigate, ROUTES.home)
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

    navigate(getRestaurantReservationNewPath(restaurant.id))
  }

  const handlePressMenuItem = (menuId: string) => {
    navigate(getRestaurantMenuDetailPath(restaurant.id, menuId), {
      state: { source: 'detail' },
    })
  }

  return (
    <>
      {seoPage ? <PageSeo page={seoPage} /> : null}
      <RestaurantDetailTemplate
        activeTab={detailContent.activeTab}
        hasMoreMenus={detailContent.hasMoreMenus}
        hasMoreReviews={detailContent.hasMoreReviews}
        isMenuListError={detailContent.isMenuListError}
        isReviewImageViewerOpen={detailContent.isReviewImageViewerOpen}
        isReviewListError={detailContent.isReviewListError}
        isReviewListLoading={detailContent.isReviewListLoading}
        isReviewUnavailableModalOpen={
          detailContent.isReviewUnavailableModalOpen
        }
        menuLoadMoreRef={detailContent.menuLoadMoreRef}
        onCloseReviewImageViewer={detailContent.onCloseReviewImageViewer}
        onCloseReviewUnavailableModal={
          detailContent.onCloseReviewUnavailableModal
        }
        onPressBack={handlePressBack}
        onPressLike={handlePressLike}
        onPressMenuItem={handlePressMenuItem}
        onPressReservation={handlePressReservation}
        onPressReviewImage={detailContent.onPressReviewImage}
        onPressWriteReview={reviewWriteNavigation.onPressWriteReview}
        onRetryMenuList={detailContent.onRetryMenuList}
        onRetryReviewList={detailContent.onRetryReviewList}
        onSelectReviewSort={detailContent.onSelectReviewSort}
        onTabChange={detailContent.onTabChange}
        restaurant={restaurant}
        reviewImageViewerImageUrls={detailContent.reviewImageViewerImageUrls}
        reviewImageViewerInitialIndex={
          detailContent.reviewImageViewerInitialIndex
        }
        reviewLoadMoreRef={detailContent.reviewLoadMoreRef}
        selectedReviewSort={detailContent.selectedReviewSort}
        shareUrl={getRestaurantDetailPath(restaurant.id)}
        shouldScrollToInitialTab={
          initialTab === 'menu' || initialTab === 'review'
        }
        title="식당 상세 정보"
        variant="detail"
      />
      <AuthGateBottomSheet
        onKakaoPress={() => startKakaoOAuth(getPathFromLocation(location))}
        onOpenChange={setIsAuthGateOpen}
        open={isAuthGateOpen}
      />
      <ComingSoonDialog
        onOpenChange={setIsComingSoonOpen}
        open={isComingSoonOpen}
      />
    </>
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

  return <RestaurantDetailContent restaurantId={parsedRestaurantId} />
}
