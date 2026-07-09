export const SearchResultSkeleton = () => {
  return (
    <ul
      className="flex flex-col gap-[30px] px-5 pt-[30px] pb-[30px]"
      aria-label="검색 결과 로딩 중"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li className="flex gap-3" key={index}>
          <div className="bg-warm-gray-50 h-[92px] w-[92px] shrink-0 animate-pulse rounded-[5px]" />
          <div className="flex min-w-0 flex-1 flex-col gap-3 self-center">
            <div className="bg-warm-gray-50 h-5 w-full animate-pulse rounded" />
            <div className="bg-warm-gray-50 h-5 w-3/4 animate-pulse rounded" />
            <div className="bg-warm-gray-50 h-4 w-1/2 animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  )
}
