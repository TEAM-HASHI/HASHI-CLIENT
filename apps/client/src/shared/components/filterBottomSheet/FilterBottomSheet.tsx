import { CheckIcon } from '@hashi/hds-icons'
import { BottomSheet, Button } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

type FilterOption = {
  label: string
  value: string
}

type FilterBottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  options: FilterOption[]
  selectedValue: string
  onSelect: (value: string) => void
  onReset: () => void
  onApply: () => void
}

export const FilterBottomSheet = ({
  open,
  onOpenChange,
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
    <div className="grid grid-cols-2 gap-[7px]">
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
      footer={sheetFooter}
      open={open}
      onOpenChange={onOpenChange}
      title={<span className="typo-sub-header-2">{title}</span>}
    >
      <ul className="flex flex-col gap-[5px] pt-[40px] pb-1">
        {options.map((option) => {
          const isSelected = option.value === selectedValue

          return (
            <li key={option.value}>
              <button
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-5 w-full items-center justify-between py-[10px] text-black',
                  isSelected ? 'typo-body-3' : 'typo-body-4',
                )}
                onClick={() => onSelect(option.value)}
                type="button"
              >
                <span>{option.label}</span>
                {isSelected && (
                  <CheckIcon
                    aria-hidden="true"
                    className="text-cool-gray-700 size-5 shrink-0"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
