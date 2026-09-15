import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1 rounded-[5px] px-4',
    'whitespace-nowrap',
    'disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-cool-gray-800 text-white enabled:hover:bg-cool-gray-700 enabled:active:bg-cool-gray-900 disabled:bg-warm-gray-100 disabled:text-white',
        neutral:
          'bg-secondary-200 text-black enabled:hover:bg-warm-gray-50 enabled:active:bg-warm-gray-100 disabled:bg-secondary-200 disabled:text-warm-gray-300',
        destructive:
          'bg-secondary-200 text-primary-400 enabled:hover:bg-warm-gray-50 enabled:active:bg-warm-gray-100 disabled:bg-secondary-200 disabled:text-warm-gray-300',
        ghost:
          'bg-transparent px-2.5 text-primary-200 enabled:hover:text-cool-gray-400 enabled:active:text-cool-gray-900 disabled:text-warm-gray-300',
      },
      size: {
        sm: 'typo-body-6 h-7',
        md: 'typo-body-6 h-9',
        lg: 'typo-sub-header-2 h-10.5',
        xl: 'typo-sub-header-2 h-13',
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
