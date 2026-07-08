import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RestaurantMenuSection } from '@/features/restaurantDetail/components/RestaurantMenuSection'
import { MOCK_RESTAURANT_DETAIL } from '@/features/restaurantDetail/mocks/restaurantDetail.mock'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { ShareIconButton } from '@/shared/components/shareIconButton'

const getRestaurantDetailPath = (restaurantId: string) =>
  ROUTES.restaurantDetail.replace(':restaurantId', restaurantId)

const getRestaurantMenuDetailPath = (restaurantId: string, menuId: string) =>
  ROUTES.restaurantMenuDetail
    .replace(':restaurantId', restaurantId)
    .replace(':menuId', menuId)

export const RestaurantMenuDetailPage = () => {
  const navigate = useNavigate()
  const { menuId, restaurantId } = useParams()
  const currentRestaurantId = restaurantId ?? MOCK_RESTAURANT_DETAIL.id
  const selectedMenu =
    MOCK_RESTAURANT_DETAIL.menus.find((menu) => menu.id === menuId) ??
    MOCK_RESTAURANT_DETAIL.menus[0]
  const otherMenus = MOCK_RESTAURANT_DETAIL.menus.filter(
    (menu) => menu.id !== selectedMenu.id,
  )
  const otherMenusForDisplay = otherMenus.map((menu, index) => ({
    ...menu,
    isRepresentative: index < 2,
  }))

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [menuId])

  const handlePressBack = () => {
    navigate(-1)
  }

  const handlePressLike = () => {
    // TODO: 에러컴포넌트 머지 시, 에러페이지로 이동
  }

  const handlePressReservation = () => {
    // TODO: 예약 페이지 route 확정 후 이동 처리
  }

  const handlePressMenuItem = (nextMenuId: string) => {
    navigate(getRestaurantMenuDetailPath(currentRestaurantId, nextMenuId))
  }

  const handleTabChange = (tab: RestaurantDetailTab) => {
    if (tab === 'menu') {
      return
    }

    navigate(getRestaurantDetailPath(currentRestaurantId))
  }

  return (
    <main className="min-h-dvh bg-white pb-[calc(82px+var(--safe-area-bottom,0px))]">
      <Header
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handlePressBack} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        rightAction={<ShareIconButton />}
        title={MOCK_RESTAURANT_DETAIL.name}
        variant="largeTitle"
      />

      <RestaurantDetailTabs
        activeTab="menu"
        onTabChange={handleTabChange}
        reviewCount={MOCK_RESTAURANT_DETAIL.reviewCount}
      />

      <div className="bg-secondary-200 h-[234px]" aria-hidden="true" />

      <section className="border-warm-gray-50 border-b-8 p-6">
        <h1 className="typo-header-3 text-primary-200">{selectedMenu.name}</h1>
        <p className="typo-body-2 text-primary-400 mt-1 flex gap-0.5">
          <span className="font-medium">{selectedMenu.priceCurrency}</span>
          <span className="font-semibold">{selectedMenu.price}</span>
        </p>
        <p className="typo-long-body-1 text-primary-200 mt-4 break-keep">
          {selectedMenu.description}
        </p>
      </section>

      <section aria-labelledby="other-menu-heading">
        <h2
          className="typo-sub-header-1 text-primary-200 px-5 pt-7"
          id="other-menu-heading"
        >
          다른 메뉴{' '}
          <span className="text-warm-gray-300">{otherMenus.length}</span>
        </h2>
        <div className="mt-2">
          <RestaurantMenuSection
            menus={otherMenusForDisplay}
            onPressMenuItem={handlePressMenuItem}
          />
        </div>
      </section>

      <RestaurantBottomBar
        likeCount={MOCK_RESTAURANT_DETAIL.likeCount}
        onPressLike={handlePressLike}
        onPressReservation={handlePressReservation}
        variant="detail"
      />
    </main>
  )
}
