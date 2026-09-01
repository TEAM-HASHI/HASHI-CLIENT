import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useMemo } from 'react'

import { useMagazinesPage } from '@/pages/magazines/hooks/useMagazinesPage'
import { MagazineHeroBannerSection } from '@/pages/magazines/sections/MagazineHeroBannerSection'
import { RecommendedMagazineSection } from '@/pages/magazines/sections/RecommendedMagazineSection'
import {
  createMagazineListSeoPage,
  mergeSeoMagazines,
  PageSeo,
} from '@/shared/seo'

export const MagazinesPage = () => {
  const {
    handleBackClick,
    hasNextMagazinePage,
    hasHeroBanners,
    hasRecommendedMagazines,
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
    seoRecommendedMagazines,
  } = useMagazinesPage()
  const seoPage = useMemo(
    () =>
      createMagazineListSeoPage({
        magazines: mergeSeoMagazines(
          heroBanners.map((banner) => ({
            externalUrl: banner.instagramUrl,
            id: banner.id,
            image: banner.imageUrl,
            title: banner.accessibilityLabel,
          })),
          seoRecommendedMagazines.map((magazine) => ({
            externalUrl: magazine.instagramUrl,
            id: magazine.id,
            image: magazine.imageUrl,
            publishedDate: magazine.publishedDate,
            title: magazine.title,
          })),
        ).slice(0, 10),
      }),
    [heroBanners, seoRecommendedMagazines],
  )
  const shouldRegisterSeo =
    !isHeroBannerLoading &&
    !isHeroBannerError &&
    !isRecommendedMagazineLoading &&
    !isRecommendedMagazineError

  return (
    <>
      {shouldRegisterSeo ? <PageSeo page={seoPage} /> : null}
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
          {hasHeroBanners || isHeroBannerLoading || isHeroBannerError ? (
            <MagazineHeroBannerSection
              banners={heroBanners}
              isError={isHeroBannerError}
              isLoading={isHeroBannerLoading}
              onRetry={() => {
                void refetchHeroBanners()
              }}
            />
          ) : null}
          <RecommendedMagazineSection
            hasNextPage={hasNextMagazinePage}
            isError={isRecommendedMagazineError}
            isFetchingNextPage={isFetchingNextMagazinePage}
            isLoading={isRecommendedMagazineLoading}
            loadMoreRef={loadMoreRef}
            magazines={hasRecommendedMagazines ? recommendedMagazines : []}
            onRetry={() => {
              void refetchRecommendedMagazines()
            }}
          />
        </main>
      </div>
    </>
  )
}
