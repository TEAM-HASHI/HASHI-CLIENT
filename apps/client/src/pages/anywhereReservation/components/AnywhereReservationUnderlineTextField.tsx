import type { ChangeEvent, ComponentPropsWithoutRef } from 'react'
import { useId } from 'react'

interface AnywhereReservationUnderlineTextFieldProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'className' | 'onChange' | 'value'
> {
  label: string
  value: string
  onValueChange: (value: string) => void
}

export const AnywhereReservationUnderlineTextField = ({
  label,
  value,
  onValueChange,
  id,
  ...props
}: AnywhereReservationUnderlineTextFieldProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value)
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="typo-sub-header-1 text-black" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...props}
        className="border-warm-gray-100 typo-body-4 placeholder:text-warm-gray-300 text-primary-200 h-[43px] w-full border-0 border-b bg-transparent px-0 pt-2.5 pb-[9px] outline-none focus-visible:border-black"
        id={inputId}
        onChange={handleChange}
        value={value}
      />
    </div>
  )
}
