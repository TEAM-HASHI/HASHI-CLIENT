import { Button } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

import emptyImage from '@/shared/assets/images/empty.webp'
import { cn } from '@/shared/utils'

type EmptyProps = {
  description: ReactNode
  actionLabel: string
  onAction: () => void
  className?: string
}

export const Empty = ({
  description,
  actionLabel,
  onAction,
  className,
}: EmptyProps) => {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center text-center',
        className,
      )}
    >
      <img
        alt=""
        aria-hidden="true"
        className="mb-9.5 h-auto w-33.75 shrink-0"
        src={emptyImage}
      />
      <p className="typo-header-3 text-primary-200 leading-normal">
        {description}
      </p>
      <Button
        className="mt-4 w-59.25"
        onClick={onAction}
        size="md"
        type="button"
      >
        {actionLabel}
      </Button>
    </div>
  )
}
