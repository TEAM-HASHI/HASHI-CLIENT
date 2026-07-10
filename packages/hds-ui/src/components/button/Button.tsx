import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1 rounded-[5px] px-4',
    'typo-body-6 whitespace-nowrap',
    'disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-cool-gray-800 text-white enabled:active:bg-cool-gray-300 disabled:bg-secondary-200 disabled:text-warm-gray-300',
        neutral:
          'bg-secondary-200 text-cool-gray-900 enabled:active:bg-warm-gray-100 disabled:bg-secondary-200 disabled:text-warm-gray-300',
      },
      size: {
        sm: 'h-[2.25rem]',
        md: 'h-[2.625rem]',
        lg: 'h-[2.875rem]',
        xl: 'h-[3.25rem]',
      },
      width: {
        fit: 'w-fit',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
      width: 'fit',
    },
  },
)

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>['size']
>
export type ButtonWidth = NonNullable<
  VariantProps<typeof buttonVariants>['width']
>

export type ButtonProps = {
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'disabled'> &
  VariantProps<typeof buttonVariants> & {
    className?: string
    disabled?: boolean
  }

export const Button = ({
  variant,
  size,
  width,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading
  const shouldRenderIcons = !loading

  return (
    <button
      className={cn(buttonVariants({ variant, size, width }), className)}
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : leftIcon ? (
        <span aria-hidden="true" className="shrink-0 leading-none">
          {leftIcon}
        </span>
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
      {shouldRenderIcons && rightIcon ? (
        <span aria-hidden="true" className="shrink-0 leading-none">
          {rightIcon}
        </span>
      ) : null}
    </button>
  )
}
