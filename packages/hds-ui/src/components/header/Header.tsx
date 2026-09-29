import { cva, type VariantProps } from 'class-variance-authority'
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
} from 'react'

import { cn } from '../../utils'
import { IconButton } from '../iconButton'

const headerVariants = cva('relative w-full bg-white text-primary-200', {
  variants: {
    variant: {
      center: 'h-[75px]',
      largeTitle: 'h-[77px]',
    },
    elevated: {
      true: 'shadow-header',
      false: 'shadow-none',
    },
  },
  defaultVariants: {
    variant: 'center',
    elevated: true,
  },
})

type HeaderVariantProps = VariantProps<typeof headerVariants>

export type HeaderVariant = NonNullable<HeaderVariantProps['variant']>

type HeaderActionButtonProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'onClick'
>

export type HeaderIconAction = HeaderActionButtonProps & {
  type: 'icon'
  icon: ReactNode
  ariaLabel: string
}

export type HeaderTextAction = HeaderActionButtonProps & {
  type: 'text'
  label: string
}

export type HeaderRightAction = HeaderIconAction | HeaderTextAction

type HeaderNativeProps = Omit<
  ComponentPropsWithoutRef<'header'>,
  'children' | 'className' | 'title'
>

type HeaderBaseProps = {
  title: ReactNode
  leftAction?: ReactNode
  rightAction?: HeaderRightAction
  elevated?: boolean
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
  elevated = true,
  variant = 'center',
  className,
  contentClassName,
  ...props
}: HeaderProps) => {
  const isLargeTitle = variant === 'largeTitle'
  const hasSubtitle = !isLargeTitle && hasRenderableContent(subtitle)
  const shouldElevate = elevated && !hasSubtitle

  return (
    <header
      {...props}
      className={cn(
        headerVariants({ variant, elevated: shouldElevate }),
        className,
      )}
    >
      {leftAction ? (
        <div className="text-cool-gray-900 absolute top-[33px] left-[13px] flex size-6 items-center justify-center">
          {leftAction}
        </div>
      ) : null}
      {rightAction ? (
        <div
          className={cn(
            'text-cool-gray-900 absolute flex items-center',
            rightAction.type === 'text'
              ? 'top-[26px] right-3 h-[39px] w-[45px] justify-end'
              : 'top-[33px] right-5 size-6 justify-center',
          )}
        >
          {rightAction.type === 'icon' ? (
            <IconButton
              aria-label={rightAction.ariaLabel}
              disabled={rightAction.disabled}
              onClick={rightAction.onClick}
              size="xs"
            >
              {rightAction.icon}
            </IconButton>
          ) : (
            <button
              className="typo-body-6 text-primary-200 inline-flex h-[35px] w-[45px] items-center justify-center truncate whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={rightAction.disabled}
              onClick={rightAction.onClick}
              type="button"
            >
              {rightAction.label}
            </button>
          )}
        </div>
      ) : null}
      <div
        className={cn(
          isLargeTitle
            ? 'absolute top-[33px] right-16 left-[57px] min-w-0 text-left'
            : cn(
                'absolute top-[34.5px] flex min-w-0 flex-col items-center text-center',
                rightAction?.type === 'text'
                  ? 'inset-x-[57px]'
                  : 'inset-x-[45px]',
              ),
          contentClassName,
        )}
      >
        <div
          className={cn(
            isLargeTitle
              ? 'typo-header-2 max-w-full truncate text-left whitespace-nowrap'
              : 'typo-sub-header-1 max-w-full truncate whitespace-nowrap',
          )}
        >
          {title}
        </div>
        {hasSubtitle ? (
          <div className="typo-caption-2 mt-[1.5px] max-w-full truncate leading-[18px] whitespace-nowrap">
            {subtitle}
          </div>
        ) : null}
      </div>
    </header>
  )
}
