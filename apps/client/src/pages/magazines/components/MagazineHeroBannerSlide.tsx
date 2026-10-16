import { Banner } from '@hashi/hds-ui'
import { Link } from 'react-router-dom'

import { getMagazineDetailPath } from '@/app/router/routePaths'
import type { MagazineHeroBanner } from '@/pages/magazines/types'

interface Props {
  banner: MagazineHeroBanner
}

export const MagazineHeroBannerSlide = ({ banner }: Props) => {
  return (
    <Link
      aria-label={banner.title}
      className="bg-cool-gray-100 relative block size-full overflow-hidden"
      state={{
        magazinePreview: {
          imageUrl: banner.imageUrl,
          title: banner.title,
        },
      }}
      to={getMagazineDetailPath(banner.id)}
    >
      <Banner imageAlt="" imageSrc={banner.imageUrl} />
    </Link>
  )
}
