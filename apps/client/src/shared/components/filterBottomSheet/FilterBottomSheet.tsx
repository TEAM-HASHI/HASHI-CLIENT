import { BottomSheet, Button, OptionItem } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

type FilterOption = {
  label: string
  value: string
}

type FilterBottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  maxHeightClassName,
  title,
  options,
  selectedValue,
  onSelect,
  onReset,
  onApply,
}: FilterBottomSheetProps) => {
  const handleResetClick = () => {
    onReset()
    onOpenChange(false)
  }

  const sheetFooter = (
    <div className="grid grid-cols-2 gap-3.25">
      <Button
        onClick={handleResetClick}
        size="md"
        variant="neutral"
        width="full"
      >
        초기화
      </Button>
      <Button onClick={onApply} size="md" variant="primary" width="full">
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
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="typo-sub-header-2">{title}</span>}
    >
      <div
        className="max-h-[calc(100dvh-180px)] overflow-y-auto"
        data-testid="filter-bottom-sheet-content"
      >
        <ul className="flex flex-col gap-1.25 pt-10 pb-1">
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
