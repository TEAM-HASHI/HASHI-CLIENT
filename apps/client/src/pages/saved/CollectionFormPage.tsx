import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import {
  createCollection,
  updateCollection,
} from '@/pages/saved/utils/collectionMutations'
import { getCollectionReturn } from '@/pages/saved/utils/collectionNavigation'

export const CollectionFormPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const { data, setData } = useCollectionData()
  const navigate = useNavigate()
  const location = useLocation()
  const collection = data.collections.find((item) => item.id === collectionId)
  if (collectionId && !collection) return <Navigate to={ROUTES.saved} replace />
  const returnTo = getCollectionReturn(location.state)
  const handleClose = () => {
    // 앱에서 진입했다면 원래 history 항목으로 돌아가 복귀 화면을 중복하지 않는다.
    if (returnTo.key) navigate(-1)
    else
      navigate(
        { pathname: returnTo.pathname, search: returnTo.search },
        { replace: true, state: returnTo.state },
      )
  }
  return (
    <CollectionForm
      key={collectionId ?? 'new'}
      collection={collection}
      collections={data.collections}
      onClose={handleClose}
      onDiscard={() => navigate(ROUTES.saved, { replace: true })}
      onSubmit={(draft) => {
        setData((current) =>
          collection
            ? updateCollection(current, collection.id, draft)
            : createCollection(
                current,
                draft,
                `mock-${crypto.randomUUID()}`,
                new Date().toISOString(),
              ),
        )
        handleClose()
      }}
    />
  )
}
