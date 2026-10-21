import { Thumbnail } from '@hashi/hds-ui'
import compactBookmark from '@/shared/assets/icons/collection-bookmark-compact.svg'
import bookmark from '@/shared/assets/icons/collection-bookmark.svg'
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
      'grid shrink-0 grid-cols-2 grid-rows-2',
      compact ? 'size-12.5 gap-0.5' : 'size-25 gap-1',
    )}
  >
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden',
        compact
          ? 'rounded-[1px] rounded-tl-[5px]'
          : 'rounded-[2px] rounded-tl-[10px]',
      )}
      style={
        collection.color ? COLLECTION_COVER_COLORS[collection.color] : undefined
      }
    >
      {collection.color ? (
        <span
          className={compact ? 'h-3.75 w-4' : 'h-7.5 w-8'}
          style={{
            backgroundColor: 'currentColor',
            maskImage: `url("${compact ? compactBookmark : bookmark}")`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      ) : (
        <Thumbnail
          alt=""
          className={compact ? 'size-6 rounded-none' : 'size-12 rounded-none'}
        />
      )}
    </div>
    {collection.coverImages.map((src, index) => (
      <div
        key={index}
        className={cn(
          'overflow-hidden',
          compact ? 'size-6 rounded-[1px]' : 'size-12 rounded-[2px]',
          index === 0 && (compact ? 'rounded-tr-[6px]' : 'rounded-tr-[12px]'),
          index === 1 && (compact ? 'rounded-bl-[5px]' : 'rounded-bl-[10px]'),
          index === 2 && (compact ? 'rounded-br-[5px]' : 'rounded-br-[10px]'),
        )}
      >
        <Thumbnail
          alt=""
          src={src}
          className={cn(
            'size-12 rounded-none',
            compact && 'origin-top-left scale-50',
          )}
        />
      </div>
    ))}
  </div>
)
