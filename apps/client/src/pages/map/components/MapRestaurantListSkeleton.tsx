export const MapRestaurantListSkeleton = ({
  count = 3,
}: {
  count?: number
}) => (
  <div role="status" aria-label="식당 목록 로딩 중">
    <span className="sr-only">식당 목록을 불러오고 있어요.</span>
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="border-warm-gray-50 border-b py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="bg-secondary-200 h-6 w-3/5 rounded" />
              <div className="bg-secondary-200 h-4 w-2/5 rounded" />
              <div className="bg-secondary-200 h-4 w-4/5 rounded" />
            </div>
            <div className="bg-secondary-200 h-9 w-7 rounded" />
          </div>
          <div className="mt-3 flex gap-2 overflow-hidden">
            {[0, 1, 2].map((image) => (
              <div
                key={image}
                className="bg-secondary-200 size-33.75 shrink-0 rounded-[5px]"
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  </div>
)
