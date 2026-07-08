import { CancelIcon, CheckIcon } from '@hashi/hds-icons'
import { BottomSheet, Button } from '@hashi/hds-ui'

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
  options: FilterOption[]
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
  return (
    <BottomSheet
      closeOnEscape={false}
      closeOnOverlayClick={false}
      aria-label={title}
      className="rounded-t-[10px]"
      contentClassName="px-0"
      open={open}
      overlayClassName="bg-[#1d1d1d]/70"
      onOpenChange={onOpenChange}
      showCloseButton={false}
      showHandle={false}
    >
      <div
        className={cn(
          'flex max-h-[calc(100dvh-40px)] flex-col pt-7',
          maxHeightClassName,
        )}
        data-testid="filter-bottom-sheet-content"
      >
        <div className="relative mx-6 h-6">
          <h2 className="absolute inset-x-10 top-1/2 -translate-y-1/2 text-center text-[16px] font-semibold text-black">
            {title}
          </h2>
          <button
            aria-label="닫기"
            className="absolute top-0 right-0 flex size-6 items-center justify-center"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <CancelIcon aria-hidden="true" className="size-6" />
          </button>
        </div>

        <ul className="mx-6 mt-[39px] flex flex-1 flex-col gap-[5px] overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === selectedValue

            return (
              <li key={option.value}>
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-10 w-full items-center justify-between text-[16px] text-black',
                    isSelected ? 'font-medium' : 'font-normal',
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

        <div className="mt-5 h-[111px] w-full shrink-0 px-5 pt-4">
          <div className="grid grid-cols-2 gap-[13px]">
            <Button
              className="h-[51px] text-[16px] font-medium"
              onClick={onReset}
              size="xl"
              variant="neutral"
              width="full"
            >
              초기화
            </Button>
            <Button
              className="h-[51px] text-[16px] font-medium"
              onClick={onApply}
              size="xl"
              variant="primary"
              width="full"
            >
              적용
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
