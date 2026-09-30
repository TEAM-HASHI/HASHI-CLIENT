import { Button, Chip } from '@hashi/hds-ui'
import { useState } from 'react'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'
import { RestaurantPhotoViewer } from '@/features/restaurantDetail/components/RestaurantPhotoViewer'
import type { useRestaurantPhotos } from '@/features/restaurantDetail/hooks/useRestaurantPhotos'
import type { RestaurantPhotoFilter } from '@/features/restaurantDetail/types/restaurantPhoto'
import { ListEmptyState } from '@/shared/components/listEmptyState'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'

const FILTERS: { value: RestaurantPhotoFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'representative', label: '대표사진' },
  { value: 'menu', label: '메뉴사진' },
  { value: 'review', label: '리뷰사진' },
]

interface RestaurantPhotoSectionProps {
  model: ReturnType<typeof useRestaurantPhotos>
  onResetScroll: () => void
}

export const RestaurantPhotoSection = ({
  model,
  onResetScroll,
}: RestaurantPhotoSectionProps) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const { photos, counts, filter, query, enabled } = model
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetching) void query.fetchNextPage()
  }
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled:
      enabled && query.hasNextPage && !query.isError && viewerIndex === null,
    isLoading: query.isFetching,
    onIntersect: loadMore,
  })

  if (!enabled) {
    return (
      <section aria-label="사진" className="px-5 pt-9 pb-9">
        <ListEmptyState description="등록된 사진이 없습니다." />
      </section>
    )
  }

  return (
    <section aria-label="사진" className="px-5 pb-9">
      <div
        aria-label="사진 분류"
        className="flex h-18.75 items-start gap-2 overflow-x-auto pt-5"
      >
        {FILTERS.map(({ value, label }) => (
          <Chip
            key={value}
            className="h-9 shrink-0"
            count={counts?.[value]}
            selected={filter === value}
            onSelectedChange={() => {
              if (value === filter) return
              setViewerIndex(null)
              model.selectFilter(value)
              onResetScroll()
            }}
          >
            {label}
          </Chip>
        ))}
      </div>
      {query.isPending ? (
        <div
          role="status"
          aria-label="사진 불러오는 중"
          className="grid grid-cols-2 gap-5"
        >
          <div className="bg-secondary-200 h-47.25 animate-pulse rounded-[5px]" />
          <div className="bg-secondary-200 h-66.25 animate-pulse rounded-[5px]" />
        </div>
      ) : null}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 items-start gap-x-5.25">
          {[0, 1].map((column) => (
            <div key={column} className="flex min-w-0 flex-col gap-5">
              {photos.map((photo, index) =>
                index % 2 === column ? (
                  <button
                    type="button"
                    key={photo.id}
                    aria-label={`${index + 1}번째 사진 보기`}
                    className="block w-full overflow-hidden rounded-[5px]"
                    style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                    onClick={() => setViewerIndex(index)}
                  >
                    <RestaurantImage
                      src={photo.thumbnailUrl}
                      className="size-full object-cover"
                      markSize="lg"
                    />
                  </button>
                ) : null,
              )}
            </div>
          ))}
        </div>
      )}
      {query.isError && (
        <div role="alert" className="py-6 text-center">
          <p className="typo-body-5 text-primary-200 mb-3">
            {photos.length
              ? '사진을 더 불러오지 못했어요.'
              : '사진을 불러오지 못했어요.'}
          </p>
          <Button
            onClick={() => {
              if (query.isFetchNextPageError) loadMore()
              else void query.refetch()
            }}
          >
            다시 시도
          </Button>
        </div>
      )}
      {!query.isPending && !query.isError && photos.length === 0 && (
        <ListEmptyState description="등록된 사진이 없어요." />
      )}
      {query.isFetchingNextPage && (
        <p role="status" className="typo-body-5 py-5 text-center">
          사진을 불러오는 중입니다.
        </p>
      )}
      <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
      {viewerIndex !== null && (
        <RestaurantPhotoViewer
          photos={photos}
          total={counts?.[filter] ?? photos.length}
          initialIndex={viewerIndex}
          hasMore={query.hasNextPage}
          isLoading={query.isFetchingNextPage}
          isError={query.isFetchNextPageError}
          onLoadMore={loadMore}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </section>
  )
}
