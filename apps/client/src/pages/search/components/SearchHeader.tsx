import { BackIcon } from '@hashi/hds-icons'
import { IconButton, SearchField } from '@hashi/hds-ui'
import type { Ref } from 'react'
import type { SyntheticEvent } from 'react'

interface SearchHeaderProps {
  inputRef: Ref<HTMLInputElement>
  keyword: string
  onBackClick: () => void
  onKeywordChange: (keyword: string) => void
  onSearchSubmit: () => void
}

export const SearchHeader = ({
  inputRef,
  keyword,
  onBackClick,
  onKeywordChange,
  onSearchSubmit,
}: SearchHeaderProps) => {
  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearchSubmit()
  }

  return (
    <form
      className="flex w-full items-center gap-2.5 px-5 pt-[30px] pb-[9px]"
      onSubmit={handleSubmit}
      role="search"
    >
      <IconButton
        aria-label="뒤로가기"
        className="text-cool-gray-900"
        onClick={onBackClick}
        size="xs"
      >
        <BackIcon className="size-6" />
      </IconButton>
      <SearchField
        ref={inputRef}
        aria-label="식당 또는 메뉴 검색"
        className="min-w-0 flex-1"
        onChange={(event) => {
          onKeywordChange(event.target.value)
        }}
        placeholder="식당 혹은 메뉴를 검색해보세요"
        value={keyword}
      />
    </form>
  )
}
