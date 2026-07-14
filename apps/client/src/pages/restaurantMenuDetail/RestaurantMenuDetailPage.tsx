import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'
import {
  RESTAURANT_DETAIL_TAB_BAR_HEIGHT,
  RESTAURANT_MENU_DETAIL_HEADER_HEIGHT,
} from '@/features/restaurantDetail/constants/restaurantDetailLayout'
import { NotFoundPage } from '@/pages/notFound'
import { RestaurantOtherMenuSection } from '@/pages/restaurantMenuDetail/components/RestaurantOtherMenuSection'
import { RestaurantSelectedMenuSection } from '@/pages/restaurantMenuDetail/components/RestaurantSelectedMenuSection'
import { useRestaurantMenuDetailPage } from '@/pages/restaurantMenuDetail/hooks/useRestaurantMenuDetailPage'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { ShareIconButton } from '@/shared/components/shareIconButton'

export const RestaurantMenuDetailPage = () => {
  const {
    error,
    isAuthGateOpen,
    isComingSoonOpen,
    isLoading,
    isNotFound,
    hasMoreOtherMenus,
    otherMenuLoadMoreRef,
    otherMenusForDisplay,
    otherMenuTotalCount,
    restaurant,
    selectedMenu,
    shareUrl,
    onAuthGateOpenChange,
    onComingSoonOpenChange,
    onPressBack,
    onPressKakao,
    onPressLike,
    onPressMenuItem,
    onPressReservation,
    onTabChange,
  } = useRestaurantMenuDetailPage()

  if (isNotFound) {
    return <NotFoundPage />
  }

  if (error) {
    throw error
  }

  if (isLoading || !restaurant || !selectedMenu) {
    return <LoadingScreen />
  }

  return (
    <div
      className="min-h-dvh bg-white pb-[calc(82px+var(--safe-area-bottom,0px))]"
      data-testid="restaurant-menu-detail-page"
    >
      <div
        className="z-fixed fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] bg-white"
        data-testid="restaurant-menu-detail-fixed-header"
      >
        <Header
          leftAction={
            <IconButton aria-label="뒤로가기" onClick={onPressBack} size="xs">
              <BackIcon className="size-6" />
            </IconButton>
          }
          className="h-[75px]"
          rightAction={<ShareIconButton shareUrl={shareUrl} />}
          title={
            <span className="block truncate whitespace-nowrap">
              {restaurant.name}
            </span>
          }
          variant="largeTitle"
        />
      </div>

      <div
        className="z-fixed fixed inset-x-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] bg-white"
        data-testid="restaurant-menu-detail-tab-fixed-container"
        style={{ top: RESTAURANT_MENU_DETAIL_HEADER_HEIGHT }}
      >
        <RestaurantDetailTabs
          activeTab="menu"
          onTabChange={onTabChange}
          reviewCount={restaurant.reviewCount}
        />
      </div>
      <div
        aria-hidden="true"
        data-testid="restaurant-menu-detail-fixed-spacer"
        style={{
          height:
            RESTAURANT_MENU_DETAIL_HEADER_HEIGHT +
            RESTAURANT_DETAIL_TAB_BAR_HEIGHT,
        }}
      />

      <RestaurantImage
        className="h-[234px] w-full object-cover"
        defaultImageTestId="restaurant-menu-detail-default-image"
        logoSize="lg"
        src={selectedMenu.imageUrl}
      />

      <RestaurantSelectedMenuSection menu={selectedMenu} />

      <RestaurantOtherMenuSection
        hasMoreMenus={hasMoreOtherMenus}
        loadMoreRef={otherMenuLoadMoreRef}
        menus={otherMenusForDisplay}
        onPressMenuItem={onPressMenuItem}
        totalCount={otherMenuTotalCount}
      />

      <RestaurantBottomBar
        likeCount={restaurant.likeCount}
        onPressLike={onPressLike}
        onPressReservation={onPressReservation}
        variant="detail"
      />
      <AuthGateBottomSheet
        onKakaoPress={onPressKakao}
        onOpenChange={onAuthGateOpenChange}
        open={isAuthGateOpen}
      />
      <ComingSoonDialog
        onOpenChange={onComingSoonOpenChange}
        open={isComingSoonOpen}
      />
    </div>
  )
}
