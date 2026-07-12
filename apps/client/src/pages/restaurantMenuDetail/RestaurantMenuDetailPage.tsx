import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RestaurantOtherMenuSection } from '@/pages/restaurantMenuDetail/components/RestaurantOtherMenuSection'
import { RestaurantSelectedMenuSection } from '@/pages/restaurantMenuDetail/components/RestaurantSelectedMenuSection'
import { useRestaurantMenuDetailPage } from '@/pages/restaurantMenuDetail/hooks/useRestaurantMenuDetailPage'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { DefaultImage } from '@/shared/components/defaultImage'
import { ShareIconButton } from '@/shared/components/shareIconButton'

export const RestaurantMenuDetailPage = () => {
  const {
    isAuthGateOpen,
    isComingSoonOpen,
    otherMenus,
    otherMenusForDisplay,
    restaurant,
    selectedMenu,
    shareUrl,
    onAuthGateOpenChange,
    onComingSoonOpenChange,
    onPressBack,
    onPressLike,
    onPressMenuItem,
    onPressReservation,
    onTabChange,
  } = useRestaurantMenuDetailPage()

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

      {selectedMenu.imageUrl ? (
        <img
          alt=""
          className="h-[234px] w-full object-cover"
          src={selectedMenu.imageUrl}
        />
      ) : (
        <DefaultImage
          aria-hidden="true"
          className="h-[234px] w-full"
          logoSize="lg"
        />
      )}

      <RestaurantSelectedMenuSection menu={selectedMenu} />

      <RestaurantOtherMenuSection
        menus={otherMenusForDisplay}
        onPressMenuItem={onPressMenuItem}
        totalCount={otherMenus.length}
      />

      <RestaurantBottomBar
        likeCount={restaurant.likeCount}
        onPressLike={onPressLike}
        onPressReservation={onPressReservation}
        variant="detail"
      />
      <AuthGateBottomSheet
        onKakaoPress={() => undefined}
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
