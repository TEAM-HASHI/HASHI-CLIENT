import {
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useId,
  useRef,
} from 'react'
import { cn } from '../../utils'

type InputFieldBaseProps = Omit<
  ComponentPropsWithRef<'input'>,
  'aria-label' | 'aria-labelledby' | 'className' | 'size'
> & {
  rightIcon?: ReactNode
  rightElement?: ReactNode
  className?: string
}

type InputFieldA11yProps =
  | {
      label: string
      'aria-label'?: string
      'aria-labelledby'?: string
    }
  | {
      label?: undefined
      'aria-label': string
      'aria-labelledby'?: string
    }
  | {
      label?: undefined
      'aria-label'?: string
      'aria-labelledby': string
    }

export type InputFieldProps = InputFieldBaseProps & InputFieldA11yProps

const setRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (!ref) {
    return
  }

  if (typeof ref === 'function') {
    ref(value)
    return
  }

  ref.current = value
}

export const InputField = ({
  label,
  rightIcon,
  rightElement,
  className,
  id,
  disabled = false,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: InputFieldProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasRightContent = rightIcon != null || rightElement != null

  const handleWrapperMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    const target = event.target as HTMLElement

    if (target.closest('[data-input-field-right-content]')) {
      return
    }

    if (event.target !== inputRef.current) {
      event.preventDefault()
      inputRef.current?.focus()
    }
  }

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
        onMouseDown={handleWrapperMouseDown}
      >
        <input
          {...props}
          id={inputId}
          ref={(node) => {
            inputRef.current = node
            setRef(ref, node)
          }}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          disabled={disabled}
          className="typo-body-4 text-primary-200 placeholder:text-warm-gray-300 disabled:text-warm-gray-300 min-w-0 flex-1 bg-transparent font-sans outline-none disabled:cursor-not-allowed"
        />

        {hasRightContent ? (
          <div
            data-input-field-right-content
            className="ml-2.5 flex shrink-0 items-center gap-2.5"
          >
            {rightIcon ? (
              <span
                aria-hidden="true"
                className="inline-flex size-[22px] shrink-0 items-center justify-center"
              >
                {rightIcon}
              </span>
            ) : null}
            {rightElement ? (
              <span
                aria-disabled={disabled || undefined}
                inert={disabled || undefined}
                className={cn(
                  'inline-flex shrink-0 items-center',
                  disabled && 'pointer-events-none',
                )}
              >
                {rightElement}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
