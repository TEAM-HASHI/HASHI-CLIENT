import { KeywordChipList } from '@/pages/search/components/KeywordChipList'
import { RecentRestaurants } from '@/pages/search/components/RecentRestaurants'

interface SearchIdlePanelProps {
  recentSearchKeywords: string[]
  recommendedSearchKeywords: readonly string[]
  onKeywordSelect: (keyword: string) => void
  onRecentKeywordsClear: () => void
}

export const SearchIdlePanel = ({
  recentSearchKeywords,
  recommendedSearchKeywords,
  onKeywordSelect,
  onRecentKeywordsClear,
}: SearchIdlePanelProps) => {
  return (
    <div className="flex flex-col gap-[38px] px-5 pt-[26px]">
      {recentSearchKeywords.length > 0 && (
        <section aria-labelledby="recent-search-keywords-title">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="typo-sub-header-3 text-primary-200"
              id="recent-search-keywords-title"
            >
              최근 검색어
            </h2>
            <button
              type="button"
              aria-label="최근 검색어 전체 삭제"
              className="typo-body-7 text-cool-gray-500"
              onClick={onRecentKeywordsClear}
            >
              전체 삭제
            </button>
          </div>
          <KeywordChipList
            keywords={recentSearchKeywords}
            onKeywordSelect={onKeywordSelect}
          />
        </section>
      )}
      <RecentRestaurants />
      {recommendedSearchKeywords.length > 0 && (
        <section aria-labelledby="recommended-search-keywords-title">
          <h2
            className="typo-sub-header-3 text-primary-200 mb-4"
            id="recommended-search-keywords-title"
          >
            추천 검색어
          </h2>
          <KeywordChipList
            keywords={recommendedSearchKeywords}
            onKeywordSelect={onKeywordSelect}
          />
        </section>
      )}
    </div>
  )
}
