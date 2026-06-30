import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils'

const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 appearance-none items-center justify-center border-0 bg-transparent p-0 text-inherit',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-40 data-[loading=true]:opacity-100',
  ],
  {
    variants: {
      size: {
        xs: 'size-6',
        md: 'size-10',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>

export type IconButtonSize = NonNullable<IconButtonVariantProps['size']>

export type IconButtonProps = {
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
      className={cn(iconButtonVariants({ size }), className)}
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
