import { MenuIcon, SaveIcon } from '@hashi/hds-icons'
import { cn } from '@/shared/utils'
import type { ReactNode } from 'react'

import type { SavedCollection } from '@/pages/saved/types'
import { CollectionCover } from '@/pages/saved/components/CollectionCover'

type CollectionListRowProps = {
  collection: SavedCollection
  restaurantCount: number
  onSelect: () => void
  moreAction?: ReactNode
  compact?: boolean
}

export const CollectionListRow = ({
  collection,
  restaurantCount,
  onSelect,
  moreAction,
  compact = false,
}: CollectionListRowProps) => (
  <li
    className={cn(
      'border-warm-gray-50 flex border-b',
      compact ? 'items-center gap-3 py-4.5' : 'items-start gap-4 py-4',
    )}
  >
    <button
      type="button"
      className={cn(
        'flex min-w-0 flex-1 text-left focus-visible:outline-2',
        compact ? 'items-center gap-3' : 'items-start gap-4',
      )}
      onClick={onSelect}
    >
      <CollectionCover collection={collection} compact={compact} />
      <span
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          compact ? 'min-h-10.5 justify-between' : 'gap-0.5',
        )}
      >
        <span className="typo-sub-header-2 text-cool-gray-900 [overflow-wrap:anywhere] break-words">
          {collection.name}
        </span>
        <span
          className={cn(
            'text-cool-gray-600 flex flex-wrap items-center gap-2',
            compact ? 'typo-body-7' : 'typo-body-3',
          )}
        >
          <span className="flex items-center">
            <SaveIcon
              aria-hidden="true"
              className={cn(
                'text-warm-gray-100',
                compact ? 'size-4' : 'size-6',
              )}
            />
            {restaurantCount}
          </span>
          {!compact && (
            <span className="border-warm-gray-50 border-l px-2">
              {collection.isPublic ? '공개' : '비공개'}
            </span>
          )}
        </span>
      </span>
    </button>
    {moreAction ?? (
      <MenuIcon
        aria-hidden="true"
        className={cn(
          'text-warm-gray-300 size-4.5 shrink-0',
          compact && 'mt-1 self-start',
        )}
      />
    )}
  </li>
)
