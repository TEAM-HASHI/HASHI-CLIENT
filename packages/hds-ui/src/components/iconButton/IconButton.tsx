import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils'

const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 appearance-none items-center justify-center border-0 p-0 text-inherit',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40 data-[loading=true]:opacity-100',
  ],
  {
    variants: {
      variant: {
        plain: 'bg-transparent',
        soft: 'rounded-full bg-white enabled:hover:bg-primary-100 enabled:active:bg-warm-gray-100',
      },
      size: {
        xs: 'size-6',
        sm: 'size-9',
        md: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'plain',
      size: 'md',
    },
  },
)

type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>

export type IconButtonSize = NonNullable<IconButtonVariantProps['size']>
export type IconButtonVariant = NonNullable<IconButtonVariantProps['variant']>

export type IconButtonProps = {
  variant?: IconButtonVariant
  size?: IconButtonSize
  loading?: boolean
  disabled?: boolean
  className?: string
  children: ReactNode
  'aria-label': string
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled' | 'children' | 'aria-label'
>

export const IconButton = ({
  variant,
  size,
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) => {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      className={cn(iconButtonVariants({ variant, size }), className)}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <span aria-hidden="true" className="inline-flex shrink-0 leading-none">
          {children}
        </span>
      )}
    </button>
  )
}
