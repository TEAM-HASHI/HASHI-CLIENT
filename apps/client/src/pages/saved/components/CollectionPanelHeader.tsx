import { BackIcon, MenuIcon, SaveIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

import { CollectionDropdown } from '@/pages/saved/components/CollectionDropdown'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
} from '@/features/collection/types'
import type { CollectionViewState } from '@/features/collection/types'
import { cn } from '@/shared/utils'
import { normalizeCollectionDescription } from '@/pages/saved/utils/collectionMutations'

type CollectionPanelHeaderProps = {
  collection: { name?: string; description?: string }
  restaurantCount?: number
  isFullscreen: boolean
  onCollapse?: () => void
  view: CollectionViewState
  onViewChange: (view: CollectionViewState) => void
  menu: 'sort' | 'category' | null
  onMenuChange: (menu: 'sort' | 'category' | null) => void
  actions?: ReactNode
}

export const CollectionPanelHeader = ({
  collection,
  restaurantCount,
  isFullscreen,
  onCollapse,
  view,
  onViewChange,
  menu,
  onMenuChange,
  actions,
}: CollectionPanelHeaderProps) => (
  <>
    {isFullscreen ? (
      <div className="relative">
        <Header
          title={
            <h2
              className="text-cool-gray-900 max-w-full truncate"
              title={collection.name}
            >
              {collection.name}
            </h2>
          }
          subtitle="저장한 장소"
          leftAction={
            <IconButton
              size="xs"
              aria-label="패널로 돌아가기"
              onClick={onCollapse}
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          contentClassName={cn(
            '[&>div:first-child]:typo-sub-header-2',
            actions && 'inset-x-20',
          )}
        />
        {actions ? (
          <div className="absolute top-7 right-5 flex items-center gap-1">
            {actions}
          </div>
        ) : (
          <MenuIcon
            aria-hidden="true"
            className="text-warm-gray-300 absolute top-8.25 right-5 size-4.5"
          />
        )}
      </div>
    ) : (
      <div className="px-5 pt-1.5">
        <div className="flex items-start gap-3">
          <h2 className="typo-sub-header-1 text-primary-200 min-w-0 flex-1 leading-6.5 [overflow-wrap:anywhere] break-words">
            {collection.name}
          </h2>
          {actions ? (
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          ) : (
            <MenuIcon
              aria-hidden="true"
              className="text-warm-gray-300 mt-1 size-4.5 shrink-0"
            />
          )}
        </div>
        {collection.description && (
          <p className="typo-body-6 text-cool-gray-400 mt-2 leading-[1.36] [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
            {normalizeCollectionDescription(collection.description)}
          </p>
        )}
      </div>
    )}
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-5',
        isFullscreen ? 'h-11.5' : 'py-4',
      )}
    >
      {isFullscreen ? (
        <p className="typo-body-5 text-primary-200 shrink-0">
          총 {restaurantCount}곳
        </p>
      ) : (
        <span className="typo-body-6 text-cool-gray-600 flex items-center gap-0.5">
          <SaveIcon aria-hidden="true" className="text-warm-gray-100 size-4" />
          {restaurantCount}
        </span>
      )}
      <div className="flex items-center gap-3.75">
        <CollectionDropdown
          label="정렬"
          options={COLLECTION_SORT_OPTIONS}
          value={view.sort}
          open={menu === 'sort'}
          onOpenChange={(open) => onMenuChange(open ? 'sort' : null)}
          onChange={(sort) => onViewChange({ ...view, sort })}
        />
        <CollectionDropdown
          label="분류"
          options={COLLECTION_CATEGORY_OPTIONS}
          value={view.category}
          open={menu === 'category'}
          onOpenChange={(open) => onMenuChange(open ? 'category' : null)}
          onChange={(category) => onViewChange({ ...view, category })}
        />
      </div>
    </div>
  </>
)
