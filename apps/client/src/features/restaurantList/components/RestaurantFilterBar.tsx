import { TapDownIcon } from '@hashi/hds-icons'

type RestaurantFilterBarProps = {
  sortLabel: string
  categoryLabel: string
  onClickSort: () => void
  onClickCategory: () => void
}

const filterButtonClassName =
  'text-cool-gray-600 flex items-center gap-0.5 rounded-[5px] text-left text-[14px] leading-[1.36] font-medium'

export const RestaurantFilterBar = ({
  sortLabel,
  categoryLabel,
  onClickSort,
  onClickCategory,
}: RestaurantFilterBarProps) => {
  return (
    <div
      className="flex items-center gap-5 p-5"
      data-testid="restaurant-filter-bar"
    >
      <button
        aria-label={`정렬 필터: ${sortLabel}`}
        className={filterButtonClassName}
        onClick={onClickSort}
        type="button"
      >
        <span>{sortLabel}</span>
        <TapDownIcon
          aria-hidden="true"
          className="text-cool-gray-600 size-5 shrink-0"
        />
      </button>
      <button
        aria-label={`음식 장르 필터: ${categoryLabel}`}
        className={filterButtonClassName}
        onClick={onClickCategory}
        type="button"
      >
        <span>{categoryLabel}</span>
        <TapDownIcon
          aria-hidden="true"
          className="text-cool-gray-600 size-5 shrink-0"
        />
      </button>
    </div>
  )
}
