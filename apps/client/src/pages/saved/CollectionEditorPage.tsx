import { useEffect } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { getCollectionDetailPath } from '@/app/router/routePaths'
import { CollectionEditor } from '@/pages/saved/components/CollectionEditor'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import {
  COLLECTION_SORT_OPTIONS,
  COLLECTION_CATEGORY_OPTIONS,
} from '@/pages/saved/types'
import {
  getCollectionEditorReturnKey,
  getCollectionManagementAction,
  getCollectionManagementState,
} from '@/pages/saved/utils/collectionNavigation'

export const CollectionEditorPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const { data, setData } = useCollectionData()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const restored = getCollectionManagementAction(location.state)
  useEffect(() => {
    if (
      restored?.collectionId !== collectionId ||
      restored?.type !== 'edit' ||
      (restored.restaurantIds === undefined && restored.dialog === undefined)
    )
      return
    // 복귀용 선택은 현재 편집에서만 사용하고 다음 history 방문에는 남기지 않는다.
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(location.state, {
          collectionId: restored.collectionId,
          type: 'edit',
        }),
      },
    )
  }, [collectionId, location, navigate, restored])
  if (
    !collectionId ||
    !data.collections.some((item) => item.id === collectionId)
  )
    return <Navigate to={ROUTES.saved} replace />
  const view = {
    collectionId,
    sort:
      COLLECTION_SORT_OPTIONS.find((item) => item.value === params.get('sort'))
        ?.value ?? 'latest',
    category:
      COLLECTION_CATEGORY_OPTIONS.find(
        (item) => item.value === params.get('category'),
      )?.value ?? 'all',
  }
  const action =
    restored?.collectionId === collectionId && restored.type === 'edit'
      ? restored
      : { collectionId, type: 'edit' as const }
  const close = () => {
    if (getCollectionEditorReturnKey(location.state)) {
      navigate(-1)
      return
    }
    navigate(
      {
        pathname: getCollectionDetailPath(collectionId),
        search: new URLSearchParams({
          sort: view.sort,
          category: view.category,
        }).toString(),
      },
      { replace: true },
    )
  }
  return (
    <CollectionEditor
      key={collectionId}
      action={action}
      data={data}
      onDataChange={setData}
      view={view}
      onClose={close}
      onDeleted={() => navigate(ROUTES.saved, { replace: true })}
    />
  )
}
