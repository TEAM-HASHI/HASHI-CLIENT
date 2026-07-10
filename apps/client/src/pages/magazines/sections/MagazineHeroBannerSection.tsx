import { Carousel } from '@hashi/hds-ui'

import { MagazineHeroBannerSlide } from '@/pages/magazines/components/MagazineHeroBannerSlide'
import type { MagazineHeroBanner } from '@/pages/magazines/types'

interface Props {
  banners: MagazineHeroBanner[]
}

export const MagazineHeroBannerSection = ({ banners }: Props) => {
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
