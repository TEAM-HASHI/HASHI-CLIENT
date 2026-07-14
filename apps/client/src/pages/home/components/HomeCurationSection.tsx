import { Carousel } from '@hashi/hds-ui'

import type { HomeBanner } from '@/pages/home/homeContent'

interface HomeCurationSectionProps {
  banners: HomeBanner[]
  isError: boolean
  isLoading: boolean
  onRetry: () => void
}

export const HomeCurationSection = ({
  banners,
  isError,
  isLoading,
  onRetry,
}: HomeCurationSectionProps) => {
  if (isLoading) {
    return (
      <section className="mt-5" aria-labelledby="home-curation-heading">
        <h2
          className="typo-sub-header-1 text-primary-200"
          id="home-curation-heading"
        >
          맛집 큐레이션을 둘러보세요!
        </h2>
        <div
          aria-label="맛집 큐레이션 배너 로딩 중"
          className="bg-cool-gray-100 mt-2.5 aspect-[353/160] w-full rounded-[8px]"
        />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mt-5" aria-labelledby="home-curation-heading">
        <h2
          className="typo-sub-header-1 text-primary-200"
          id="home-curation-heading"
        >
          맛집 큐레이션을 둘러보세요!
        </h2>
        <div className="bg-cool-gray-50 mt-2.5 rounded-[8px] px-5 py-8 text-center">
          <p className="typo-body-3 text-cool-gray-600">
            큐레이션 배너를 불러오지 못했어요.
          </p>
          <button
            className="typo-body-6 text-primary-200 mt-3"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </section>
    )
  }

  if (banners.length === 0) {
    return null
  }

  const renderBannerImage = ({ imageAlt, imageUrl }: HomeBanner) => (
    <img alt={imageAlt} className="size-full object-cover" src={imageUrl} />
  )

  return (
    <section className="mt-5" aria-labelledby="home-curation-heading">
      <h2
        className="typo-sub-header-1 text-primary-200"
        id="home-curation-heading"
      >
        맛집 큐레이션을 둘러보세요!
      </h2>
      <Carousel.Root
        aria-label="맛집 큐레이션 배너"
        className="mt-2.5"
        defaultIndex={0}
      >
        <Carousel.Viewport className="aspect-[353/160] w-full overflow-y-hidden rounded-[8px]">
          <Carousel.Track>
            {banners.map((banner) => (
              <Carousel.Item key={banner.id}>
                {banner.instagramUrl ? (
                  <a
                    className="block size-full"
                    href={banner.instagramUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {renderBannerImage(banner)}
                  </a>
                ) : (
                  <div aria-disabled="true" className="block size-full">
                    {renderBannerImage(banner)}
                  </div>
                )}
              </Carousel.Item>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator
          activeDotClassName="h-1 w-3 bg-cool-gray-700"
          className="bottom-3"
          dotClassName="size-1 bg-warm-gray-300"
        />
      </Carousel.Root>
    </section>
  )
}
