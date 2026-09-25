import { MagazineCoverCarousel } from '@/pages/magazineDetail/components/MagazineCoverCarousel'
import { MagazineLikeButton } from '@/pages/magazineDetail/components/MagazineLikeButton'
import type { MagazineDetailPreview } from '@/pages/magazineDetail/types'

type MagazineArticleData = Pick<
  MagazineDetailPreview,
  'content' | 'coverImageUrls' | 'hashtag' | 'publishedAt' | 'title'
>

interface MagazineArticleProps {
  isLiked: boolean
  likeCount: number
  magazine: MagazineArticleData
  magazineId: string
  onLikeToggle: () => void
}

export const MagazineArticle = ({
  isLiked,
  likeCount,
  magazine,
  magazineId,
  onLikeToggle,
}: MagazineArticleProps) => {
  return (
    <article>
      <MagazineCoverCarousel
        imageUrls={magazine.coverImageUrls}
        key={magazineId}
        title={magazine.title}
      />

      <div className="border-warm-gray-50 flex items-center border-b px-5 py-2.75">
        <MagazineLikeButton
          count={likeCount}
          isLiked={isLiked}
          onClick={onLikeToggle}
        />
      </div>

      <div className="border-primary-100 flex flex-col gap-3 border-b-8 px-5 pt-4 pb-7">
        <div className="typo-body-5 flex flex-col gap-3">
          <p className="text-primary-200 whitespace-pre-wrap">
            {magazine.content}
          </p>
          <p className="text-cool-gray-500">{magazine.hashtag}</p>
        </div>
        <time className="typo-caption-2 text-warm-gray-300 leading-4.5">
          {magazine.publishedAt}
        </time>
      </div>
    </article>
  )
}
