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
} from '@/pages/saved/utils/collectionNavigation'

export const CollectionEditorPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const { data, setData } = useCollectionData()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
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
  const restored = getCollectionManagementAction(location.state)
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
