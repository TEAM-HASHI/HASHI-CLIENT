import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getCollectionEditPath,
  getCollectionRestaurantEditPath,
} from '@/app/router/routePaths'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import {
  CollectionActionMenu,
  CollectionEditMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { CollectionDeleteQueryDialog } from '@/pages/saved/components/CollectionDeleteQueryDialog'
import { CollectionTargetQueryDialog } from '@/pages/saved/components/CollectionTargetQueryDialog'
import type { CollectionManagementAction } from '@/pages/saved/components/CollectionEditor'
import { SavedQueryPage } from '@/pages/saved/SavedQueryPage'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
} from '@/pages/saved/types'
import { isCollectionMapState } from '@/pages/saved/utils/collectionMapState'
import {
  getCollectionFormState,
  getCollectionManagementAction,
  getCollectionManagementState,
  getCollectionSaveRestaurantId,
  getCollectionSaveState,
} from '@/pages/saved/utils/collectionNavigation'

export const SavedApiPage = () => {
  const location = useLocation()
  return <SavedApiScreen key={location.pathname} />
}

const SavedApiScreen = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [management, setManagement] =
    useState<CollectionManagementAction | null>(() =>
      getCollectionManagementAction(location.state),
    )
  const [saveId, setSaveId] = useState(() =>
    getCollectionSaveRestaurantId(location.state),
  )
  const collectionId = management ? Number(management.collectionId) : null
  const restaurantIds = (management?.restaurantIds ?? []).map(Number)
  const validSelection =
    restaurantIds.length > 0 && restaurantIds.every(isValidCollectionId)
  const restoredView = isCollectionMapState(location.state)
    ? location.state
    : INITIAL_COLLECTION_VIEW
  const sort =
    COLLECTION_SORT_OPTIONS.find((item) => item.value === params.get('sort'))
      ?.value ?? restoredView.sort
  const category =
    COLLECTION_CATEGORY_OPTIONS.find(
      (item) => item.value === params.get('category'),
    )?.value ?? restoredView.category

  // 생성 화면 복귀용 상태는 이번 화면에서만 사용한다.
  useEffect(() => {
    if (
      !getCollectionManagementAction(location.state) &&
      !getCollectionSaveRestaurantId(location.state)
    )
      return
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(
          getCollectionSaveState(location.state, null),
          null,
        ),
      },
    )
  }, [location, navigate])

  const close = () => {
    setManagement(null)
    setSaveId(null)
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(
          getCollectionSaveState(location.state, null),
          null,
        ),
      },
    )
  }
  return (
    <>
      <SavedQueryPage
        onCreate={() =>
          navigate(ROUTES.collectionNew, {
            state: getCollectionFormState(location),
          })
        }
        renderCollectionActions={(collection) => (
          <CollectionEditMenu
            name={collection.name ?? ''}
            onEdit={() =>
              navigate(getCollectionEditPath(collection.id), {
                state: getCollectionFormState(location),
              })
            }
            onDelete={() =>
              setManagement({ collectionId: collection.id, type: 'delete' })
            }
          />
        )}
        renderDetailActions={(collection) => (
          <CollectionActionMenu
            label="컬렉션 더보기"
            onManage={() =>
              navigate(
                `${getCollectionRestaurantEditPath(collection.id)}?${new URLSearchParams({ sort, category })}`,
                { state: { collectionEditorReturnKey: location.key } },
              )
            }
            onDelete={() =>
              setManagement({ collectionId: collection.id, type: 'delete' })
            }
          />
        )}
        renderRestaurantActions={(restaurant, collection) => (
          <CollectionActionMenu
            restaurant
            label={`${restaurant.name} 더보기`}
            onManage={() =>
              setManagement({
                collectionId: collection.id,
                type: 'move',
                restaurantIds: [restaurant.id],
              })
            }
            onDelete={() =>
              setManagement({
                collectionId: collection.id,
                type: 'remove',
                restaurantIds: [restaurant.id],
              })
            }
          />
        )}
      />
      {isValidCollectionId(collectionId) && management?.type === 'delete' && (
        <CollectionDeleteQueryDialog
          kind="collection"
          collectionId={collectionId}
          onClose={close}
          onDeleted={() => navigate(ROUTES.saved, { replace: true })}
        />
      )}
      {isValidCollectionId(collectionId) &&
        validSelection &&
        management?.type === 'remove' && (
          <CollectionDeleteQueryDialog
            kind="restaurants"
            collectionId={collectionId}
            restaurantIds={restaurantIds}
            onClose={close}
          />
        )}
      {isValidCollectionId(collectionId) &&
        validSelection &&
        management?.type === 'move' && (
          <CollectionTargetQueryDialog
            mode="move"
            sourceCollectionId={collectionId}
            restaurantIds={restaurantIds}
            createState={getCollectionManagementState(
              location.state,
              management,
            )}
            onClose={close}
          />
        )}
      {saveId !== null && isValidCollectionId(Number(saveId)) && (
        <CollectionTargetQueryDialog
          mode="save"
          restaurantId={Number(saveId)}
          onClose={close}
        />
      )}
    </>
  )
}
