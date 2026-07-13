export const RestaurantReviewListSkeleton = () => {
  return (
    <div aria-label="리뷰 목록 로딩 중" className="flex flex-col" role="status">
      {Array.from({ length: 3 }, (_, index) => (
        <article
          className="border-warm-gray-100 flex flex-col gap-4 border-b pt-5 pb-7"
          key={index}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-secondary-200 size-10 shrink-0 animate-pulse rounded-full" />
              <div className="bg-secondary-200 h-5 w-24 animate-pulse rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div className="bg-secondary-200 h-4 w-24 animate-pulse rounded" />
              <div className="bg-secondary-200 h-4 w-16 animate-pulse rounded" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-secondary-200 h-4 w-full animate-pulse rounded" />
              <div className="bg-secondary-200 h-4 w-4/5 animate-pulse rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, imageIndex) => (
              <div
                className="bg-secondary-200 size-[135px] shrink-0 animate-pulse"
                key={imageIndex}
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
