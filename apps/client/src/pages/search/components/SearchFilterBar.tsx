import { TapDownIcon } from '@hashi/hds-icons'

interface SearchFilterBarProps {
  categoryLabel: string
  onCategoryClick: () => void
  onSortClick: () => void
  sortLabel: string
}

interface SearchFilterTriggerProps {
  label: string
  onClick: () => void
}

const SearchFilterTrigger = ({ label, onClick }: SearchFilterTriggerProps) => {
  return (
    <button
      className="typo-sub-header-3 text-primary-200 flex items-center gap-3"
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <TapDownIcon aria-hidden="true" className="size-4 text-black" />
    </button>
  )
}

export const SearchFilterBar = ({
  categoryLabel,
  onCategoryClick,
  onSortClick,
  sortLabel,
}: SearchFilterBarProps) => {
  return (
    <div className="flex items-center gap-3 px-5 py-[9px]">
      <SearchFilterTrigger label={sortLabel} onClick={onSortClick} />
      <SearchFilterTrigger label={categoryLabel} onClick={onCategoryClick} />
    </div>
  )
}
