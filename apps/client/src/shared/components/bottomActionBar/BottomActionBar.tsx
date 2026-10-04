import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/utils'

type BottomActionBarProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'role'
> & {
  'aria-label': string
  layout?: 'standard' | 'compact'
  leadingAction?: ReactNode
  startAction?: ReactNode
  endAction: ReactNode
}

export const BottomActionBar = ({
  'aria-label': ariaLabel,
  layout = 'standard',
  leadingAction,
  startAction,
  endAction,
  className,
  ...props
}: BottomActionBarProps) => {
  const isCompact = layout === 'compact'

  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'app-mobile-fixed-bottom z-fixed bg-white px-5 pt-4',
        isCompact
          ? 'min-h-[calc(var(--app-mobile-bottom-action-compact-height)+var(--safe-area-bottom,0px))]'
          : 'min-h-[calc(var(--app-mobile-bottom-action-height)+var(--safe-area-bottom,0px))]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center',
          isCompact ? 'h-[49px] gap-[17px]' : 'gap-4',
        )}
      >
        {leadingAction ? <div className="shrink-0">{leadingAction}</div> : null}
        <div
          className={cn(
            'grid min-w-0 flex-1 gap-4',
            startAction ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          {startAction}
          {endAction}
        </div>
      </div>
    </div>
  )
}
