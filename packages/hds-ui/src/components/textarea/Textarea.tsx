import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type InputEvent as ReactInputEvent,
  useId,
  useState,
} from 'react'
import { cn } from '../../utils'

const getTextLength = (value: ComponentPropsWithRef<'textarea'>['value']) => {
  if (value === undefined || value === null) {
    return 0
  }

  return String(value).length
}

const limitText = (
  value: ComponentPropsWithRef<'textarea'>['value'],
  maxLength: ComponentPropsWithRef<'textarea'>['maxLength'],
) => {
  if (value === undefined || value === null || maxLength === undefined) {
    return value
  }

  return String(value).slice(0, maxLength)
}

export interface TextareaProps extends Omit<
  ComponentPropsWithRef<'textarea'>,
  'children' | 'className'
> {
  helperText?: string
  showCounter?: boolean
  className?: string
}

export const Textarea = ({
  helperText,
  showCounter,
  className,
  value,
  defaultValue,
  maxLength,
  disabled = false,
  onBeforeInput,
  onChange,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}: TextareaProps) => {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const helperTextId = `${textareaId}-helper-text`
  const counterId = `${textareaId}-counter`

  const isControlled = value !== undefined
  const limitedValue = limitText(value, maxLength)
  const limitedDefaultValue = limitText(defaultValue, maxLength)
  const [uncontrolledValue, setUncontrolledValue] = useState(
    () => limitedDefaultValue,
  )
  const currentValue = isControlled ? limitedValue : uncontrolledValue
  const count = getTextLength(currentValue)
  const shouldShowCounter = showCounter ?? maxLength !== undefined
  const hasHelperText = helperText != null && helperText !== ''
  const hasSupportRow = hasHelperText || shouldShowCounter

  const describedBy = [
    ariaDescribedBy,
    hasHelperText ? helperTextId : undefined,
    shouldShowCounter ? counterId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const handleBeforeInput = (event: ReactInputEvent<HTMLTextAreaElement>) => {
    onBeforeInput?.(event)

    if (event.defaultPrevented || maxLength === undefined) {
      return
    }

    const textarea = event.currentTarget
    const inputEvent = event.nativeEvent as globalThis.InputEvent
    const selectedLength = textarea.selectionEnd - textarea.selectionStart

    if (
      selectedLength === 0 &&
      textarea.value.length >= maxLength &&
      inputEvent.data
    ) {
      event.preventDefault()
    }
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue =
      maxLength === undefined
        ? event.currentTarget.value
        : event.currentTarget.value.slice(0, maxLength)

    if (event.currentTarget.value !== nextValue) {
      event.currentTarget.value = nextValue
    }

    if (!isControlled) {
      setUncontrolledValue(nextValue)
    }

    onChange?.(event)
  }

  return (
    <div
      className={cn('flex w-[22.0625rem] max-w-full flex-col gap-2', className)}
    >
      <textarea
        {...props}
        id={textareaId}
        aria-describedby={describedBy || undefined}
        value={isControlled ? limitedValue : uncontrolledValue}
        maxLength={maxLength}
        disabled={disabled}
        onBeforeInput={handleBeforeInput}
        onChange={handleChange}
        className={cn(
          'border-warm-gray-100 min-h-[230px] w-full resize-none rounded-[10px] border bg-white p-5',
          'typo-body-4 text-primary-200 placeholder:text-warm-gray-300 font-sans',
          'focus-visible:border-cool-gray-500 focus-visible:outline-cool-gray-500 focus-visible:outline-2 focus-visible:outline-offset-0',
          'disabled:bg-secondary-200 disabled:text-warm-gray-300 disabled:cursor-not-allowed',
        )}
      />
      {hasSupportRow ? (
        <div className="typo-body-6 flex w-full items-center justify-between gap-3 font-sans leading-[1.36] whitespace-nowrap">
          {hasHelperText ? (
            <p
              id={helperTextId}
              className="text-warm-gray-300 min-w-0 truncate"
            >
              {helperText}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}
          {shouldShowCounter ? (
            <p
              id={counterId}
              aria-live="polite"
              className="flex shrink-0 items-end gap-[2px]"
            >
              <span className="text-primary-200">{count}</span>
              {maxLength !== undefined ? (
                <span className="text-warm-gray-300">/{maxLength}</span>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
