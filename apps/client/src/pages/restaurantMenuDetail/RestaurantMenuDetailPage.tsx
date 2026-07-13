import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'
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
      <Header
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={onPressBack} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        rightAction={<ShareIconButton shareUrl={shareUrl} />}
        title={restaurant.name}
        variant="largeTitle"
      />

      <RestaurantDetailTabs
        activeTab="menu"
        onTabChange={onTabChange}
        reviewCount={restaurant.reviewCount}
      />

      <RestaurantImage
        className="h-[234px] w-full object-cover"
        defaultImageTestId="restaurant-menu-detail-default-image"
        logoSize="lg"
        src={selectedMenu.imageUrl}
      />

      <RestaurantSelectedMenuSection menu={selectedMenu} />

      <RestaurantOtherMenuSection
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
