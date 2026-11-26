import { SaveIcon } from '@hashi/hds-icons'
import { Thumbnail } from '@hashi/hds-ui'
import { cn } from '@/shared/utils'
import type { CollectionSummaryReadModelTypes } from '@/features/collection/types/collectionReadModels'
import { COLLECTION_COVER_COLORS } from '@/features/collection/constants/collectionPalette'

export const CollectionCover = ({
  collection,
  compact = false,
}: {
  collection: {
    color?: CollectionSummaryReadModelTypes['color'] | null
    coverImages: CollectionSummaryReadModelTypes['coverImages']
  }
  compact?: boolean
}) => {
  const colorStyle =
    collection.color && Object.hasOwn(COLLECTION_COVER_COLORS, collection.color)
      ? COLLECTION_COVER_COLORS[
          collection.color as keyof typeof COLLECTION_COVER_COLORS
        ]
      : undefined
  return (
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
        style={colorStyle}
      >
        {colorStyle ? (
          <SaveIcon className={compact ? 'size-4.5' : 'size-9'} />
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
              compact && 'max-w-none origin-top-left scale-50',
            )}
          />
        </div>
      ))}
    </div>
  )
}
