import type { RecommendedMagazine } from '@/pages/magazines/types'

interface Props {
  magazine: RecommendedMagazine
}

export const MagazineListItem = ({ magazine }: Props) => {
  const content = (
    <>
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
        className="aspect-[353/160] w-[164px] rounded-[5px] object-cover"
        src={magazine.imageUrl}
      />
    </>
  )

  return (
    <li className="border-warm-gray-50 border-b last:border-b-0">
      {magazine.instagramUrl ? (
        <a
          className="grid grid-cols-[1fr_164px] gap-[21px] pt-5 pb-2"
          href={magazine.instagramUrl}
          rel="noreferrer"
          target="_blank"
        >
          {content}
        </a>
      ) : (
        <div
          aria-disabled="true"
          className="grid grid-cols-[1fr_164px] gap-[21px] pt-5 pb-2 opacity-60"
        >
          {content}
        </div>
      )}
    </li>
  )
}
