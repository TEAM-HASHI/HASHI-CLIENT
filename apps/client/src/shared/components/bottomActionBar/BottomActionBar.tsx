import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/utils'

type BottomActionBarProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'role'
> & {
  'aria-label': string
  leadingAction?: ReactNode
  startAction?: ReactNode
  endAction: ReactNode
}

export const BottomActionBar = ({
  'aria-label': ariaLabel,
  leadingAction,
  startAction,
  endAction,
  className,
  ...props
}: BottomActionBarProps) => {
  return (
    <div
      {...props}
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'app-mobile-fixed-bottom z-fixed bg-white px-5 pt-4 pb-[calc(48px+var(--safe-area-bottom,0px))]',
        className,
      )}
    >
      <div className="flex items-center gap-4">
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
