import { SearchField } from '@hashi/hds-ui'
import { Link } from 'react-router-dom'

interface HomeSearchEntryProps {
  to: string
}

export const HomeSearchEntry = ({ to }: HomeSearchEntryProps) => {
  return (
    <div className="relative mt-[15px]">
      <SearchField
        readOnly
        aria-hidden="true"
        aria-label="식당 혹은 메뉴를 검색해보세요"
        className="cursor-pointer"
        inputClassName="cursor-pointer"
        placeholder="식당 혹은 메뉴를 검색해보세요"
        tabIndex={-1}
      />
      <Link
        aria-label="식당 또는 메뉴 검색하기"
        className="absolute inset-0 rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        to={to}
      >
        <span className="sr-only">식당 또는 메뉴 검색하기</span>
      </Link>
    </div>
  )
}
