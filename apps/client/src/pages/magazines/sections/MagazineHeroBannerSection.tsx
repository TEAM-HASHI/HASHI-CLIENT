import { Carousel } from '@hashi/hds-ui'

import { MagazineHeroBannerSlide } from '@/pages/magazines/components/MagazineHeroBannerSlide'
import type { MagazineHeroBanner } from '@/pages/magazines/types'

interface Props {
  banners: MagazineHeroBanner[]
  isError: boolean
  isLoading: boolean
  onRetry: () => void
}

export const MagazineHeroBannerSection = ({
  banners,
  isError,
  isLoading,
  onRetry,
}: Props) => {
  if (isLoading) {
    return (
      <section
        aria-label="대표 매거진 배너 로딩 중"
        className="bg-cool-gray-100 h-[260px] w-full"
      />
    )
  }

  if (isError) {
    return (
      <section
        aria-label="대표 매거진 배너"
        className="bg-cool-gray-50 flex h-[260px] flex-col items-center justify-center px-5 text-center"
      >
        <p className="typo-body-3 text-cool-gray-600">
          매거진 배너를 불러오지 못했어요.
        </p>
        <button
          className="typo-body-6 text-primary-200 mt-3"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      </section>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <Carousel.Root aria-label="대표 매거진 배너">
      <Carousel.Viewport className="h-[260px] overflow-y-hidden">
        <Carousel.Track>
          {banners.map((banner) => (
            <Carousel.Item key={banner.id}>
              <MagazineHeroBannerSlide banner={banner} />
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicator align="end" />
    </Carousel.Root>
  )
}
