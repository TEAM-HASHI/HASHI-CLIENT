import type { InputHTMLAttributes, PropsWithChildren } from 'react'
import { CheckIcon } from '@hashi/hds-icons'
import { cn } from '../../utils'

type CheckboxProps = PropsWithChildren<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
>

export const Checkbox = ({
  children,
  className,
  disabled,
  ...props
}: CheckboxProps) => {
  return (
    <label
      className={cn(
        'group inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        className="peer sr-only"
        type="checkbox"
        disabled={disabled}
        {...props}
      />
      <span className="bg-cool-gray-100 peer-focus-visible:outline-cool-gray-800 peer-checked:text-cool-gray-800 flex h-[26px] w-[26px] items-center justify-center rounded-[3px] text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        <CheckIcon className="h-[26px] w-[26px]" />
      </span>
      {children ? <span>{children}</span> : null}
    </label>
  )
}
