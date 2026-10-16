import { PlusIcon } from '@hashi/hds-icons'

import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { CollectionEditMenu } from '@/pages/saved/components/CollectionDropdown'
import type { CollectionData } from '@/pages/saved/types'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'

type CollectionPanelListProps = {
  data: CollectionData
  onSelect: (collectionId: string) => void
  onCreate?: () => void
  onEdit?: (collectionId: string) => void
}

export const CollectionPanelList = ({
  data,
  onSelect,
  onCreate,
  onEdit,
}: CollectionPanelListProps) => (
  <>
    <div className="flex items-center justify-between px-5 pt-2 pb-1">
      <h2 className="typo-body-3 text-primary-200">
        컬렉션 <span className="font-semibold">{data.collections.length}</span>
        개
      </h2>
      <span className="typo-body-6 text-cool-gray-600">최신순</span>
    </div>
    <div className="px-5">
      <button
        type="button"
        disabled={!onCreate}
        onClick={onCreate}
        className="border-warm-gray-50 flex w-full items-center gap-3 border-b py-4.5 text-left"
      >
        <span className="bg-primary-100 flex size-12.5 shrink-0 items-center justify-center rounded-[5px]">
          <PlusIcon
            aria-hidden="true"
            className="text-primary-200 size-8 shrink-0"
          />
        </span>
        <span className="typo-body-3 text-primary-200">새 컬렉션 만들기</span>
      </button>
    </div>
    <div className="px-5">
      <ul aria-label="저장 컬렉션">
        {selectCollections(data.collections).map((item) => (
          <CollectionListRow
            key={item.id}
            compact
            collection={item}
            moreAction={
              onEdit ? (
                <CollectionEditMenu
                  name={item.name}
                  onEdit={() => onEdit(item.id)}
                />
              ) : undefined
            }
            restaurantCount={selectRestaurants(item, data.restaurants).length}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </ul>
    </div>
  </>
)
