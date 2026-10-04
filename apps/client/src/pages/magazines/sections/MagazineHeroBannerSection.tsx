import { Carousel } from '@hashi/hds-ui'

import { MagazineHeroBannerSlide } from '@/pages/magazines/components/MagazineHeroBannerSlide'
import type { MagazineHeroBanner } from '@/pages/magazines/types'

interface Props {
  banners: MagazineHeroBanner[]
  isLoading: boolean
}

export const MagazineHeroBannerSection = ({ banners, isLoading }: Props) => {
  if (isLoading) {
    return (
      <section
        aria-label="대표 매거진 배너 로딩 중"
        className="bg-secondary-200 mx-5 mt-4.5 aspect-[353/160] rounded-[5px]"
      />
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <Carousel.Root aria-label="대표 매거진 배너" className="mx-5 mt-4.5 w-auto">
      <Carousel.Viewport className="aspect-[353/160] overflow-y-hidden rounded-[5px]">
        <Carousel.Track>
          {banners.map((banner) => (
            <Carousel.Item key={banner.id}>
              <MagazineHeroBannerSlide banner={banner} />
            </Carousel.Item>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicator align="end" className="right-5 bottom-5.75" />
    </Carousel.Root>
  )
}
