import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'

import { AnywhereReservationCta } from './components/AnywhereReservationCta'
import { HomeCurationSection } from './components/HomeCurationSection'
import { HomeLogo } from './components/HomeLogo'
import { HomeQuickMenuSection } from './components/HomeQuickMenuSection'
import { HomeSearchEntry } from './components/HomeSearchEntry'
import { HotSnsRestaurantSection } from './components/HotSnsRestaurantSection'
import { useHomePage } from './hooks/useHomePage'

export const HomePage = () => {
  const {
    authGate,
    getRestaurantDetailPath,
    handleAnywhereReservationPress,
    homeBanners,
    hotSnsRestaurants,
    quickLinks,
    searchPath,
  } = useHomePage()

  return (
    <>
      <div className="px-5 pt-[18px] pb-8">
        <h1 className="sr-only">Hashi 홈</h1>
        <HomeLogo />
        <HomeSearchEntry to={searchPath} />
        <HomeCurationSection banners={homeBanners} />
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
