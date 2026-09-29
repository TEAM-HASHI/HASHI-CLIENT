import { useState } from 'react'

interface FilterOption<TValue extends string> {
  label: string
  value: TValue
}

interface UseSearchFilterSheetParams<TValue extends string> {
  appliedValue: TValue
  defaultValue: TValue
  onApplyValue: (value: TValue) => void
  options: readonly FilterOption<TValue>[]
}

export const useSearchFilterSheet = <TValue extends string>({
  appliedValue,
  defaultValue,
  onApplyValue,
  options,
}: UseSearchFilterSheetParams<TValue>) => {
  const [open, setOpen] = useState(false)
  const [pendingValue, setPendingValue] = useState(appliedValue)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setPendingValue(appliedValue)
    }
  }

  const handleSelect = (value: string) => {
    const selectedOption = options.find((option) => option.value === value)

    if (selectedOption) {
      setPendingValue(selectedOption.value)
    }
  }

  const handleApply = () => {
    setOpen(false)
    onApplyValue(pendingValue)
  }

  const handleReset = () => {
    setOpen(false)
    setPendingValue(defaultValue)
    onApplyValue(defaultValue)
  }

  return {
    open,
    options,
    selectedValue: pendingValue,
    onApply: handleApply,
    onOpenChange: handleOpenChange,
    onReset: handleReset,
    onSelect: handleSelect,
  }
}
