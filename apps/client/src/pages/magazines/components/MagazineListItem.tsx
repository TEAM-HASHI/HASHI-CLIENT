import { Link } from 'react-router-dom'

import { getMagazineDetailPath } from '@/app/router/routePaths'
import type { RecommendedMagazine } from '@/pages/magazines/types'

interface Props {
  magazine: RecommendedMagazine
}

export const MagazineListItem = ({ magazine }: Props) => {
  return (
    <li className="border-warm-gray-50 border-b last:border-b-0">
      <Link
        className="grid grid-cols-[1fr_156px] gap-5.25 py-4"
        state={{
          magazinePreview: {
            imageUrl: magazine.imageUrl,
            title: magazine.title,
          },
        }}
        to={getMagazineDetailPath(magazine.id)}
      >
        <div className="flex min-w-0 flex-col">
          <h3 className="typo-body-6 line-clamp-3 text-black">
            {magazine.title}
          </h3>
          <time className="typo-caption-1 text-warm-gray-300 mt-auto pt-5 font-medium">
            {magazine.publishedDate}
          </time>
        </div>
        <img
          alt=""
          className="aspect-156/88 w-39 rounded-[5px] object-cover"
          src={magazine.imageUrl}
        />
      </Link>
    </li>
  )
}
