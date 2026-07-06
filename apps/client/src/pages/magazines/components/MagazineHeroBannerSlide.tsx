import type { MagazineHeroBanner } from '@/pages/magazines/types'

interface Props {
  banner: MagazineHeroBanner
}

export const MagazineHeroBannerSlide = ({ banner }: Props) => {
  return (
    <a
      aria-label={banner.accessibilityLabel}
      className="bg-cool-gray-100 relative block size-full overflow-hidden"
      href={banner.instagramUrl}
      rel="noreferrer"
      target="_blank"
    >
      <img alt="" className="size-full object-cover" src={banner.imageUrl} />
    </a>
  )
}
