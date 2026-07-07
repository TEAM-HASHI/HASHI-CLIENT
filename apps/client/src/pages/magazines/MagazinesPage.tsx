import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { useMagazinesPage } from '@/pages/magazines/hooks/useMagazinesPage'
import { MagazineHeroBannerSection } from '@/pages/magazines/sections/MagazineHeroBannerSection'
import { RecommendedMagazineSection } from '@/pages/magazines/sections/RecommendedMagazineSection'

export const MagazinesPage = () => {
  const {
    handleBackClick,
    hasHeroBanners,
    hasRecommendedMagazines,
    heroBanners,
    recommendedMagazines,
  } = useMagazinesPage()

  return (
    <div className="min-h-dvh bg-white">
      <Header
        className="fixed top-0 right-0 left-0 z-20 mx-auto w-full max-w-[var(--app-mobile-max-width)] bg-white"
        leftAction={
          <IconButton
            aria-label="홈으로 돌아가기"
            onClick={handleBackClick}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="매거진"
      />

      <main className="pt-[75px]">
        {hasHeroBanners ? (
          <MagazineHeroBannerSection banners={heroBanners} />
        ) : null}
        <RecommendedMagazineSection
          magazines={hasRecommendedMagazines ? recommendedMagazines : []}
        />
      </main>
    </div>
  )
}
