import { Banner, Carousel } from '@hashi/hds-ui'

import type { MagazineHeroBanner } from '@/pages/magazines/types'

interface Props {
  banner: MagazineHeroBanner
}

export const MagazineHeroBannerSlide = ({ banner }: Props) => {
  const content = (
    <Banner
      imageAlt=""
      imageSrc={banner.imageUrl}
      indicator={<Carousel.Indicator placement="inline" />}
    />
  )

  if (!banner.instagramUrl) {
    return (
      <div
        aria-disabled="true"
        aria-label={banner.accessibilityLabel}
        className="bg-cool-gray-100 relative block size-full overflow-hidden opacity-60"
      >
        {content}
      </div>
    )
  }

  return (
    <a
      aria-label={banner.accessibilityLabel}
      className="bg-cool-gray-100 relative block size-full overflow-hidden"
      href={banner.instagramUrl}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  )
}
