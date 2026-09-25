import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { useMagazinesPage } from '@/pages/magazines/hooks/useMagazinesPage'
import { MagazineHeroBannerSection } from '@/pages/magazines/sections/MagazineHeroBannerSection'
import { RecommendedMagazineSection } from '@/pages/magazines/sections/RecommendedMagazineSection'

export const MagazinesPage = () => {
  const {
    handleBackClick,
    hasNextMagazinePage,
    heroBanners,
    isFetchingNextMagazinePage,
    isHeroBannerError,
    isHeroBannerLoading,
    isRecommendedMagazineError,
    isRecommendedMagazineLoading,
    loadMoreRef,
    refetchHeroBanners,
    refetchRecommendedMagazines,
    recommendedMagazines,
  } = useMagazinesPage()

  return (
    <div className="min-h-dvh bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <Header
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
      </div>

      <main className="pt-[75px]">
        <MagazineHeroBannerSection
          banners={heroBanners}
          isError={isHeroBannerError}
          isLoading={isHeroBannerLoading}
          onRetry={() => {
            void refetchHeroBanners()
          }}
        />
        <RecommendedMagazineSection
          hasNextPage={hasNextMagazinePage}
          isError={isRecommendedMagazineError}
          isFetchingNextPage={isFetchingNextMagazinePage}
          isLoading={isRecommendedMagazineLoading}
          loadMoreRef={loadMoreRef}
          magazines={recommendedMagazines}
          onRetry={() => {
            void refetchRecommendedMagazines()
          }}
        />
      </main>
    </div>
  )
}
