import { Chip } from '@hashi/hds-ui'

import type { FilterOption } from '@/features/restaurantList/types'

type RestaurantSortChipGroupProps = {
  options: FilterOption[]
  selectedValue: string
  onValueChange: (value: string) => void
}

export const RestaurantSortChipGroup = ({
  options,
  selectedValue,
  onValueChange,
}: RestaurantSortChipGroupProps) => {
  return (
    <div
      aria-label="정렬 기준"
      className="flex items-center gap-2 px-4.5 pb-2"
      role="group"
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          onSelectedChange={() => onValueChange(option.value)}
          selected={option.value === selectedValue}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}
