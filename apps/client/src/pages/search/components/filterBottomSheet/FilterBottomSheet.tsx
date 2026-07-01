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
  const sheetFooter = (
    <div className="grid grid-cols-2 gap-[7px]">
      <Button
        className="typo-body-6 bg-secondary-200 h-[42px] w-full rounded-[5px] border-0 text-black"
        onClick={onReset}
        type="button"
      >
        초기화
      </Button>
      <Button
        className="typo-body-6 bg-cool-gray-800 h-[42px] w-full rounded-[5px] border-0 text-white"
        onClick={onApply}
        type="button"
      >
        적용
      </Button>
    </div>
  )

  return (
    <BottomSheet
      footer={sheetFooter}
      open={open}
      onOpenChange={onOpenChange}
      title={title}
    >
      <ul className="flex flex-col gap-[20px] pt-[39px]">
        {options.map((option) => {
          const isSelected = option.value === selectedValue

          return (
            <li key={option.value}>
              <button
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-5 w-full items-center justify-between text-black',
                  isSelected ? 'typo-body-3' : 'typo-body-4',
                )}
                onClick={() => onSelect(option.value)}
                type="button"
              >
                <span>{option.label}</span>
                {isSelected && (
                  <CheckIcon aria-hidden="true" className="size-5 shrink-0" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </BottomSheet>
  )
}
