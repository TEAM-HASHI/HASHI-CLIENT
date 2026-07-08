import { MagazineEmptyState } from '@/pages/magazines/components/MagazineEmptyState'
import { MagazineListItem } from '@/pages/magazines/components/MagazineListItem'
import type { RecommendedMagazine } from '@/pages/magazines/types'

interface Props {
  magazines: RecommendedMagazine[]
}

export const RecommendedMagazineSection = ({ magazines }: Props) => {
  return (
    <section aria-labelledby="recommended-magazines-heading">
      <div className="px-5 pt-7 pb-3">
        <h2
          className="typo-header-3 text-black"
          id="recommended-magazines-heading"
        >
          최근 _한 추천 매거진
        </h2>
      </div>

      {magazines.length > 0 ? (
        <ul className="px-5">
          {magazines.map((magazine) => (
            <MagazineListItem key={magazine.id} magazine={magazine} />
          ))}
        </ul>
      ) : (
        <MagazineEmptyState />
      )}
    </section>
  )
}
