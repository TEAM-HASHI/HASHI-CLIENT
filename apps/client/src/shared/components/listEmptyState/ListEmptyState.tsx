import type { ReactNode } from 'react'

import emptyMenuImage from '@/shared/assets/images/empty-menu.webp'
import { cn } from '@/shared/utils'

interface ListEmptyStateProps {
  description: ReactNode
  className?: string
}

export const ListEmptyState = ({
  description,
  className,
}: ListEmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex min-h-[220px] flex-col items-center justify-center gap-3.5 text-center',
        className,
      )}
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-auto w-12 shrink-0"
        src={emptyMenuImage}
      />
      <p className="typo-body-5 text-warm-gray-300">{description}</p>
    </div>
  )
}
