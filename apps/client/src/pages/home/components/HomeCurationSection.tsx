import { Carousel } from '@hashi/hds-ui'

import type { HomeBanner } from '@/pages/home/homeContent'

interface HomeCurationSectionProps {
  banners: HomeBanner[]
}

export const HomeCurationSection = ({ banners }: HomeCurationSectionProps) => {
  return (
    <section className="mt-4" aria-labelledby="home-curation-heading">
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
        <Carousel.Viewport className="h-[160px] w-full overflow-y-hidden rounded-[8px]">
          <Carousel.Track>
            {banners.map(({ id, imageUrl, imageAlt, instagramUrl }) => (
              <Carousel.Item key={id}>
                <a
                  className="block size-full"
                  href={instagramUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <img
                    alt={imageAlt}
                    className="size-full object-cover"
                    src={imageUrl}
                  />
                </a>
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
