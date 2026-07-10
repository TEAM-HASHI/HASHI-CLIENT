import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../utils'

const headerVariants = cva(
  'shadow-header relative w-full bg-white text-primary-200',
  {
    variants: {
      variant: {
        center: '',
        largeTitle: 'h-[97px]',
      },
      hasSubtitle: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'center',
        hasSubtitle: true,
        className: 'h-[80px]',
      },
      {
        variant: 'center',
        hasSubtitle: false,
        className: 'h-[75px]',
      },
    ],
    defaultVariants: {
      variant: 'center',
      hasSubtitle: false,
    },
  },
)

type HeaderVariantProps = VariantProps<typeof headerVariants>

export type HeaderVariant = NonNullable<HeaderVariantProps['variant']>

type HeaderNativeProps = Omit<
  ComponentPropsWithoutRef<'header'>,
  'children' | 'className' | 'title'
>

type HeaderBaseProps = {
  title: ReactNode
  leftAction?: ReactNode
  rightAction?: ReactNode
  className?: string
  contentClassName?: string
} & HeaderNativeProps

type HeaderCenterProps = HeaderBaseProps & {
  variant?: 'center'
  subtitle?: ReactNode
}

type HeaderLargeTitleProps = HeaderBaseProps & {
  variant: 'largeTitle'
  subtitle?: never
}

export type HeaderProps = HeaderCenterProps | HeaderLargeTitleProps

const hasRenderableContent = (node: ReactNode): boolean => {
  if (node == null || typeof node === 'boolean') {
    return false
  }

  if (typeof node === 'string') {
    return node.trim().length > 0
  }

  if (Array.isArray(node)) {
    return node.some(hasRenderableContent)
  }

  return true
}

export const Header = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'center',
  className,
  contentClassName,
  ...props
}: HeaderProps) => {
  const isLargeTitle = variant === 'largeTitle'
  const hasSubtitle = !isLargeTitle && hasRenderableContent(subtitle)

  return (
    <header
      {...props}
      className={cn(headerVariants({ variant, hasSubtitle }), className)}
    >
      {leftAction ? (
        <div className="text-cool-gray-900 absolute top-[33px] left-[13px] flex size-6 items-center justify-center">
          {leftAction}
        </div>
      ) : null}
      {rightAction ? (
        <div className="text-cool-gray-900 absolute top-[33px] right-5 flex size-6 items-center justify-center">
          {rightAction}
        </div>
      ) : null}
      <div
        className={cn(
          isLargeTitle
            ? 'absolute top-[33px] right-16 left-[57px] min-w-0 text-left'
            : 'absolute inset-x-[45px] top-[34.5px] flex min-w-0 flex-col items-center text-center',
          contentClassName,
        )}
      >
        <div
          className={cn(
            isLargeTitle
              ? 'typo-header-2 line-clamp-2 max-w-full text-left'
              : 'typo-sub-header-1 max-w-full truncate whitespace-nowrap',
          )}
        >
          {title}
        </div>
        {hasSubtitle ? (
          <div className="typo-caption-2 mt-1 max-w-full truncate whitespace-nowrap">
            {subtitle}
          </div>
        ) : null}
      </div>
    </header>
  )
}
