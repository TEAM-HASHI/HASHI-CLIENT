import { KeywordChipList } from '@/pages/search/components/KeywordChipList'
import { recommendedSearchKeywords } from '@/pages/search/constants/searchFilters'

interface SearchIdlePanelProps {
  recentSearchKeywords: string[]
  onKeywordSelect: (keyword: string) => void
}

export const SearchIdlePanel = ({
  recentSearchKeywords,
  onKeywordSelect,
}: SearchIdlePanelProps) => {
  return (
    <div className="flex flex-col gap-[38px] px-5 pt-[30px]">
      {recentSearchKeywords.length > 0 && (
        <section aria-labelledby="recent-search-keywords-title">
          <h2
            className="typo-sub-header-3 text-primary-200 mb-4"
            id="recent-search-keywords-title"
          >
            최근 검색어
          </h2>
          <KeywordChipList
            keywords={recentSearchKeywords}
            onKeywordSelect={onKeywordSelect}
          />
        </section>
      )}
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
    </div>
  )
}
