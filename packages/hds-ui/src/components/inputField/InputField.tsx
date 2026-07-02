import { type ComponentPropsWithRef, type ReactNode, useId } from 'react'
import { cn } from '../../utils'

export interface InputFieldProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'className' | 'size'
> {
  label?: string
  rightIcon?: ReactNode
  rightElement?: ReactNode
  className?: string
}

export const InputField = ({
  label,
  rightIcon,
  rightElement,
  className,
  id,
  disabled = false,
  ...props
}: InputFieldProps) => {
  const generatedId = useId()
  const inputId = id ?? (label ? generatedId : undefined)
  const hasRightContent = rightIcon || rightElement

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="typo-sub-header-2 w-full font-sans text-black"
        >
          {label}
        </label>
      ) : null}

      <div
        data-disabled={disabled || undefined}
        className={cn(
          'bg-primary-100 flex h-[51px] w-full items-center rounded-[10px]',
          hasRightContent ? 'pr-[9px] pl-[15px]' : 'px-[15px]',
          'focus-within:outline-cool-gray-500 focus-within:outline-2 focus-within:outline-offset-0',
          'data-[disabled=true]:cursor-not-allowed',
          className,
        )}
      >
        <input
          {...props}
          id={inputId}
          disabled={disabled}
          className="typo-body-4 text-primary-200 placeholder:text-warm-gray-300 disabled:text-warm-gray-300 min-w-0 flex-1 bg-transparent font-sans outline-none disabled:cursor-not-allowed"
        />

        {hasRightContent ? (
          <div className="ml-2.5 flex shrink-0 items-center gap-2.5">
            {rightIcon ? (
              <span
                aria-hidden="true"
                className="text-success inline-flex size-[22px] shrink-0 items-center justify-center"
              >
                {rightIcon}
              </span>
            ) : null}
            {rightElement ? (
              <span className="inline-flex shrink-0 items-center">
                {rightElement}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
