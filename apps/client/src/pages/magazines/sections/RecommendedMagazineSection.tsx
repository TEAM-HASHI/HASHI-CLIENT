import type { RefObject } from 'react'

import { MagazineEmptyState } from '@/pages/magazines/components/MagazineEmptyState'
import { MagazineListItem } from '@/pages/magazines/components/MagazineListItem'
import type { RecommendedMagazine } from '@/pages/magazines/types'

interface Props {
  hasNextPage: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  loadMoreRef: RefObject<HTMLLIElement | null>
  magazines: RecommendedMagazine[]
  onRetry: () => void
}

const renderSkeletonItems = () => {
  return Array.from({ length: 4 }, (_, index) => (
    <li
      aria-hidden="true"
      className="border-warm-gray-50 grid grid-cols-[1fr_164px] gap-[21px] border-b pt-5 pb-2 last:border-b-0"
      key={index}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div className="bg-cool-gray-100 h-5 w-full rounded-[4px]" />
        <div className="bg-cool-gray-100 h-5 w-4/5 rounded-[4px]" />
        <div className="bg-cool-gray-100 mt-auto h-4 w-24 rounded-[4px]" />
      </div>
      <div className="bg-cool-gray-100 aspect-[353/160] w-[164px] rounded-[5px]" />
    </li>
  ))
}

export const RecommendedMagazineSection = ({
  hasNextPage,
  isError,
  isFetchingNextPage,
  isLoading,
  loadMoreRef,
  magazines,
  onRetry,
}: Props) => {
  if (isLoading) {
    return (
      <section aria-label="추천 매거진 목록" className="pt-5">
        <ul className="flex flex-col gap-5 px-5">{renderSkeletonItems()}</ul>
      </section>
    )
  }

  if (isError) {
    return (
      <section aria-label="추천 매거진 목록" className="px-5 pt-5">
        <div className="bg-cool-gray-50 rounded-[8px] px-5 py-8 text-center">
          <p className="typo-body-3 text-cool-gray-600">
            매거진을 불러오지 못했어요.
          </p>
          <button
            className="typo-body-6 text-primary-200 mt-3"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="추천 매거진 목록" className="pt-5">
      {magazines.length > 0 ? (
        <ul className="flex flex-col gap-5 px-5">
          {magazines.map((magazine) => (
            <MagazineListItem key={magazine.id} magazine={magazine} />
          ))}
          {hasNextPage && (
            <li
              aria-hidden="true"
              className="h-px"
              data-testid="magazine-list-load-more"
              ref={loadMoreRef}
            />
          )}
          {isFetchingNextPage ? renderSkeletonItems().slice(0, 1) : null}
        </ul>
      ) : (
        <MagazineEmptyState />
      )}
    </section>
  )
}
