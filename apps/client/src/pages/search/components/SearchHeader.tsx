import { BackIcon } from '@hashi/hds-icons'
import { IconButton, SearchBar } from '@hashi/hds-ui'
import type { Ref } from 'react'
import type { SyntheticEvent } from 'react'
import { MAX_SEARCH_KEYWORD_LENGTH } from '@/pages/search/utils/searchKeyword'

interface SearchHeaderProps {
  inputRef: Ref<HTMLInputElement>
  keyword: string
  onBackClick: () => void
  onKeywordChange: (keyword: string) => void
  onKeywordClear: () => void
  onSearchSubmit: () => void
}

export const SearchHeader = ({
  inputRef,
  keyword,
  onBackClick,
  onKeywordChange,
  onKeywordClear,
  onSearchSubmit,
}: SearchHeaderProps) => {
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchSubmit()
  }

  return (
    <form
      className="flex w-full items-center gap-2.5 px-5 pt-[30px] pb-1"
      onSubmit={handleSubmit}
      role="search"
    >
      <IconButton
        aria-label="뒤로가기"
        className="text-cool-gray-900 -m-2.5 size-11"
        onClick={onBackClick}
        size="xs"
      >
        <BackIcon className="size-6" />
      </IconButton>
      <SearchBar
        ref={inputRef}
        aria-label="식당 또는 메뉴 검색"
        className="min-w-0 flex-1"
        autoComplete="off"
        enterKeyHint="search"
        maxLength={MAX_SEARCH_KEYWORD_LENGTH}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.nativeEvent.isComposing)
            event.preventDefault()
        }}
        onChange={(event) => {
          onKeywordChange(event.target.value)
        }}
        onClear={onKeywordClear}
        placeholder="검색어를 입력해보세요"
        value={keyword}
      />
    </form>
  )
}
