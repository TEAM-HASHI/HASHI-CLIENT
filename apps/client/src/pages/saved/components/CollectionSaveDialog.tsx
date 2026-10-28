import { useState, type ComponentProps } from 'react'
import { useLocation } from 'react-router-dom'

import { CollectionTargetDialogView } from '@/features/collection/components/CollectionTargetDialogView'
import { getCollectionSaveSelectedId } from '@/features/collection/utils/collectionNavigation'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'
import type { CollectionData } from '@/pages/saved/types'

export const CollectionTargetDialog = ({
  data,
  ...props
}: Omit<
  ComponentProps<typeof CollectionTargetDialogView>,
  'collections' | 'selectedId' | 'onSelect'
> & { data: CollectionData }) => {
  const location = useLocation()
  const [selectedId, setSelectedId] = useState(() =>
    getCollectionSaveSelectedId(location.state),
  )
  const collections = selectCollections(data.collections).map((collection) => ({
    ...collection,
    savedCount: selectRestaurants(collection, data.restaurants).length,
  }))
  return (
    <CollectionTargetDialogView
      {...props}
      collections={collections}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  )
}
