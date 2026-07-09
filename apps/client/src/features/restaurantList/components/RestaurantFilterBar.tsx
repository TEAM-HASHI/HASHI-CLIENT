import { TapDownIcon } from '@hashi/hds-icons'

type RestaurantFilterBarProps = {
  sortLabel: string
  categoryLabel: string
  onClickSort: () => void
  onClickCategory: () => void
}

const filterButtonClassName =
  'typo-sub-header-3 text-primary-200 flex h-10 items-center gap-0.5 rounded-[5px] text-left'

export const RestaurantFilterBar = ({
  sortLabel,
  categoryLabel,
  onClickSort,
  onClickCategory,
}: RestaurantFilterBarProps) => {
  return (
    <div className="flex h-12 items-center gap-5 px-6">
      <button
        aria-label={`정렬 필터: ${sortLabel}`}
        className={filterButtonClassName}
        onClick={onClickSort}
        type="button"
      >
        <span>{sortLabel}</span>
        <TapDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 text-black"
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
          className="size-5 shrink-0 text-black"
        />
      </button>
    </div>
  )
}
