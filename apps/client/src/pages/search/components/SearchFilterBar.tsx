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
      className="typo-body-6 text-cool-gray-600 flex items-center"
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <TapDownIcon aria-hidden="true" className="size-5" />
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
    <div className="flex h-12 items-center gap-5 px-[23px]">
      <SearchFilterTrigger label={sortLabel} onClick={onSortClick} />
      <SearchFilterTrigger label={categoryLabel} onClick={onCategoryClick} />
    </div>
  )
}
