import searchEmptyImage from '@/pages/search/assets/search-empty.svg'

export const SearchEmptyState = () => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-5">
      <img
        alt=""
        aria-hidden="true"
        className="h-7 w-12"
        src={searchEmptyImage}
      />
      <p className="typo-body-2 text-warm-gray-300">검색된 식당이 없습니다.</p>
    </div>
  )
}
