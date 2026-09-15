import type { ComponentPropsWithRef, PropsWithChildren } from 'react'
import { CheckIcon } from '@hashi/hds-icons'
import { cn } from '../../utils'

export type CheckboxProps = PropsWithChildren<
  Omit<ComponentPropsWithRef<'input'>, 'type'>
>

export const Checkbox = ({
  children,
  className,
  disabled,
  ref,
  ...props
}: CheckboxProps) => {
  return (
    <label
      className={cn(
        'group/checkbox inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        ref={ref}
        className="peer sr-only"
        type="checkbox"
        disabled={disabled}
        {...props}
      />
      <span
        className={cn(
          'bg-cool-gray-100 peer-focus-visible:outline-cool-gray-800 peer-checked:text-cool-gray-900 flex h-[26px] w-[26px] items-center justify-center rounded-[3px] text-white transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
          !disabled &&
            'group-hover/checkbox:bg-cool-gray-200 group-active/checkbox:bg-cool-gray-300',
        )}
      >
        <CheckIcon
          aria-hidden="true"
          className="h-[26px] w-[26px]"
          focusable="false"
        />
      </span>
      {children ? <span>{children}</span> : null}
    </label>
  )
}
