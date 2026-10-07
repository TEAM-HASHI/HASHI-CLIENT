import { SaveIcon } from '@hashi/hds-icons'
import { Thumbnail } from '@hashi/hds-ui'
import { cn } from '@/shared/utils'

import type { SavedCollection } from '@/pages/saved/types'

// Figma collection_cover, 8317:37718/37731/37744/37757.
// 공통 토큰에 없는 컬렉션 팔레트는 확인된 값만 페이지 내부에서 관리한다.
const COLLECTION_COVER_COLORS = {
  red: { background: 'var(--color-primary-400)', color: '#bf2e2e' },
  yellow: { background: '#fdec82', color: '#efc53a' },
  green: { background: '#dedc5f', color: 'var(--color-secondary-500)' },
  purple: { background: '#c7afda', color: '#a383c7' },
} as const

export const CollectionCover = ({
  collection,
  compact = false,
}: {
  collection: SavedCollection
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
    <div
      className="flex items-center justify-center rounded-xs"
      style={COLLECTION_COVER_COLORS[collection.color]}
    >
      <SaveIcon className={compact ? 'size-5' : 'size-10'} />
    </div>
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
