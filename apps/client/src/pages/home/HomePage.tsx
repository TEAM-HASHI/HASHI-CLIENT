import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { AnywhereReservationCta } from '@/pages/home/components/AnywhereReservationCta'
import { HomeCurationSection } from '@/pages/home/components/HomeCurationSection'
import { HomeLogo } from '@/pages/home/components/HomeLogo'
import { HomeQuickMenuSection } from '@/pages/home/components/HomeQuickMenuSection'
import { HomeSearchEntry } from '@/pages/home/components/HomeSearchEntry'
import { HotSnsRestaurantSection } from '@/pages/home/components/HotSnsRestaurantSection'
import { useHomePage } from '@/pages/home/hooks/useHomePage'

export const HomePage = () => {
  const {
    authGate,
    getRestaurantDetailPath,
    handleAnywhereReservationPress,
    homeBanners,
    homeBannersState,
    hotSnsRestaurants,
    quickLinks,
    searchPath,
  } = useHomePage()

  return (
    <>
      <div className="px-5 pt-[100px] pb-8">
        <h1 className="sr-only">Hashi 홈</h1>
        <header
          aria-label="홈 상단 영역"
          className="app-mobile-fixed-top z-fixed bg-white px-5 pt-[18px] pb-4"
        >
          <HomeLogo />
          <HomeSearchEntry to={searchPath} />
        </header>
        <HomeCurationSection
          banners={homeBanners}
          isError={homeBannersState.isError}
          isLoading={homeBannersState.isLoading}
          onRetry={() => {
            void homeBannersState.onRetry()
          }}
        />
        <HomeQuickMenuSection quickLinks={quickLinks} />
        <AnywhereReservationCta
          onReservationPress={handleAnywhereReservationPress}
        />
        <HotSnsRestaurantSection
          getRestaurantDetailPath={getRestaurantDetailPath}
          restaurants={hotSnsRestaurants}
        />
      </div>
      <AuthGateBottomSheet
        open={authGate.open}
        onKakaoPress={authGate.onKakaoPress}
        onOpenChange={authGate.onOpenChange}
      />
    </>
  )
}
