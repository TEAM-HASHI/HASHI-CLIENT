import { useState, type ComponentProps } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CollectionTargetDialogView } from '@/features/collection/components/CollectionTargetDialogView'
import {
  getCollectionSaveSelectedId,
  getCollectionSaveState,
} from '@/features/collection/utils/collectionNavigation'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import { saveRestaurant } from '@/pages/saved/utils/collectionMutations'
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

export const CollectionSaveDialog = ({
  restaurantId,
  onClose,
}: {
  restaurantId: string
  onClose: () => void
}) => {
  const { data, setData } = useCollectionData()
  const location = useLocation()
  const navigate = useNavigate()
  const handleClose = () => {
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: getCollectionSaveState(location.state, null) },
    )
    onClose()
  }
  return (
    <CollectionTargetDialog
      data={data}
      onClose={handleClose}
      createState={getCollectionSaveState(location.state, restaurantId)}
      title="컬렉션 저장"
      confirmLabel={() => '저장'}
      isDisabled={(id) =>
        !data.restaurants.some(
          (r) => r.id === restaurantId && r.visibility === 'visible',
        ) ||
        Boolean(
          data.collections
            .find((c) => c.id === id)
            ?.restaurants.some((r) => r.restaurantId === restaurantId),
        )
      }
      onConfirm={(id) => {
        setData((current) =>
          saveRestaurant(current, id, restaurantId, new Date().toISOString()),
        )
        handleClose()
      }}
    />
  )
}
