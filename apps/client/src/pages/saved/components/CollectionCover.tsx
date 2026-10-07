import { SaveIcon } from '@hashi/hds-icons'
import { Thumbnail } from '@hashi/hds-ui'
import { cn } from '@/shared/utils'

import type { SavedCollection } from '@/pages/saved/types'

import { COLLECTION_COVER_COLORS } from '@/pages/saved/data/collectionPalette'

export const CollectionCover = ({
  collection,
  compact = false,
}: {
  collection: {
    color: SavedCollection['color'] | null
    coverImages: SavedCollection['coverImages']
  }
  compact?: boolean
}) => (
  <div
    aria-hidden="true"
    className={cn(
      'grid shrink-0 grid-cols-2 grid-rows-2 overflow-hidden',
      compact
        ? 'size-12.5 gap-0.5 rounded-[5px]'
        : 'size-25 gap-1 rounded-[10px]',
    )}
  >
    {collection.color ? (
      <div
        className="flex items-center justify-center rounded-xs"
        style={COLLECTION_COVER_COLORS[collection.color]}
      >
        <SaveIcon className={compact ? 'size-5' : 'size-10'} />
      </div>
    ) : (
      <Thumbnail alt="" className={compact ? 'size-6' : 'size-12 rounded-xs'} />
    )}
    {collection.coverImages.map((src, index) => (
      <div key={index} className={compact ? 'size-6' : 'size-12'}>
        <Thumbnail
          alt=""
          src={src}
          className={cn(
            'size-12 rounded-xs',
            compact && 'origin-top-left scale-50',
          )}
        />
      </div>
    ))}
  </div>
)
