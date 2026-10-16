import { BottomSheet, Button, OptionItem } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

type FilterOption = {
  label: string
  value: string
}

type FilterBottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  closeOnReset?: boolean
  layout?: 'default' | 'restaurant-list'
  maxHeightClassName?: string
  title: string
  options: readonly FilterOption[]
  selectedValue: string
  onSelect: (value: string) => void
  onReset: () => void
  onApply: () => void
}

export const FilterBottomSheet = ({
  open,
  onOpenChange,
  closeOnReset = true,
  layout = 'default',
  maxHeightClassName,
  title,
  options,
  selectedValue,
  onSelect,
  onReset,
  onApply,
}: FilterBottomSheetProps) => {
  const isRestaurantList = layout === 'restaurant-list'
  const handleResetClick = () => {
    onReset()

    if (closeOnReset) {
      onOpenChange(false)
    }
  }

  const sheetFooter = (
    <div
      className={cn('grid grid-cols-2 gap-3.25', isRestaurantList && 'gap-3')}
    >
      <Button
        onClick={handleResetClick}
        size={isRestaurantList ? 'xl' : 'md'}
        variant="neutral"
        width="full"
      >
        초기화
      </Button>
      <Button
        onClick={onApply}
        size={isRestaurantList ? 'xl' : 'md'}
        variant="primary"
        width="full"
      >
        적용
      </Button>
    </div>
  )
  return (
    <BottomSheet
      aria-label={title}
      className={cn(
        'flex max-h-[calc(100dvh-40px)] flex-col rounded-t-[10px]',
        maxHeightClassName,
      )}
      footer={sheetFooter}
      footerClassName={isRestaurantList ? 'pb-11' : undefined}
      headerClassName={
        isRestaurantList ? 'min-h-13 pt-7 [&>button]:top-7' : undefined
      }
      showHandle={!isRestaurantList}
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="typo-sub-header-2">{title}</span>}
    >
      <div
        className="max-h-[calc(100dvh-180px)] overflow-y-auto"
        data-testid="filter-bottom-sheet-content"
      >
        <ul
          className={cn(
            'flex flex-col gap-1.25 pt-10 pb-1',
            isRestaurantList && 'gap-2.5 pt-[39px] pb-5',
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === selectedValue

            return (
              <li key={option.value}>
                <OptionItem
                  onClick={() => onSelect(option.value)}
                  selected={isSelected}
                >
                  {option.label}
                </OptionItem>
              </li>
            )
          })}
        </ul>
      </div>
    </BottomSheet>
  )
}
