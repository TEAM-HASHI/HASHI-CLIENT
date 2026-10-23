import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/pages/saved/hooks/useCollectionSessionVersion'

import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'
import { useEffect, useState, type ComponentProps } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import type { UpdateCollectionBody } from '@/pages/saved/api/updateCollection'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import { COLLECTION_COVER_COLORS } from '@/pages/saved/data/collectionPalette'
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
} from '@/pages/saved/mutations/useCollectionFormMutations'
import { useCollectionsInfiniteQuery } from '@/pages/saved/queries/useCollectionsInfiniteQuery'
import { useCollectionQuery } from '@/pages/saved/queries/useCollectionQuery'
import { mapCollectionDetail } from '@/pages/saved/utils/collectionReadAdapters'
import {
  normalizeCollectionDraft,
  type CollectionDraft,
} from '@/pages/saved/utils/collectionMutations'
import { getCollectionReturn } from '@/pages/saved/utils/collectionNavigation'
import { HttpStatusError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { useAuthStatus } from '@/shared/hooks'
import { captureError } from '@/shared/lib/sentry'

type FormCollection = NonNullable<
  ComponentProps<typeof CollectionForm>['collection']
>

// 알 수 없는 이름·색상·공개 범위를 수정 초기값으로 대신 채우지 않는다.
const getEditableCollection = (
  data: CollectionDetailData | undefined,
): FormCollection | undefined => {
  if (
    !data ||
    data.owner !== true ||
    typeof data.name !== 'string' ||
    !data.color ||
    !Object.hasOwn(COLLECTION_COVER_COLORS, data.color) ||
    (data.visibility !== 'public' && data.visibility !== 'private')
  )
    return undefined
  const detail = mapCollectionDetail(data)
  return {
    id: detail.id,
    name: data.name,
    description: data.description ?? '',
    color: data.color as FormCollection['color'],
    isPublic: data.visibility === 'public',
    coverImages: detail.coverImages,
  }
}

const getChangedFields = (
  draft: CollectionDraft,
  initial: FormCollection,
): UpdateCollectionBody => {
  const next = normalizeCollectionDraft(draft)
  const previous = normalizeCollectionDraft(initial)
  return {
    ...(next.name !== previous.name && { name: draft.name }),
    ...(next.description !== previous.description && {
      description: draft.description,
    }),
    ...(next.color !== previous.color && draft.color && { color: draft.color }),
    ...(next.isPublic !== previous.isPublic && {
      visibility: draft.isPublic ? 'public' : 'private',
    }),
  }
}

/** 제품 생성·수정 라우트에서 서버 데이터와 폼 제출을 연결한다. */
export const CollectionFormQueryPage = () => {
  const sessionVersion = useCollectionSessionVersion()
  const [initialSessionVersion] = useState(sessionVersion)
  const { collectionId } = useParams<{ collectionId: string }>()
  const { isAuthenticated } = useAuthStatus()
  const editing = collectionId !== undefined
  const numericId =
    collectionId && /^[1-9]\d*$/.test(collectionId)
      ? Number(collectionId)
      : null
  const validId = isValidCollectionId(numericId)
  const query = useCollectionQuery(
    isAuthenticated && validId ? numericId : null,
  )
  const collection = getEditableCollection(query.data)
  const handleClose = useCollectionFormClose(
    initialSessionVersion === sessionVersion,
  )
  if (editing && !validId) return <Navigate to={ROUTES.saved} replace />
  if (!isAuthenticated) return null
  if (editing && !collection) {
    const error =
      query.error ??
      (query.data?.owner === false
        ? new HttpStatusError(403)
        : new Error('Invalid collection form data'))
    return (
      <section className="min-h-dvh bg-white">
        <Header
          title="컬렉션 수정"
          leftAction={
            <IconButton size="xs" aria-label="뒤로가기" onClick={handleClose}>
              <BackIcon className="size-6" />
            </IconButton>
          }
        />
        <div className="flex flex-col items-center gap-4 px-5 py-8">
          {query.isPending ? (
            <p role="status">불러오는 중…</p>
          ) : (
            <>
              <p role="alert" className="typo-body-4 text-primary-200">
                {getErrorPresentation(error).message}
              </p>
              <Button
                size="sm"
                variant="neutral"
                disabled={query.isFetching}
                onClick={() => {
                  void query.refetch()
                }}
              >
                다시 시도
              </Button>
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <CollectionApiForm
      key={`${collectionId ?? 'new'}:${sessionVersion}`}
      collection={collection}
      onClose={handleClose}
    />
  )
}

const CollectionApiForm = ({
  collection: initialCollection,
  onClose,
}: {
  onClose: () => void
  collection?: FormCollection
}) => {
  const sessionVersion = useCollectionSessionVersion()
  // 백그라운드 상세 갱신이 입력 중인 폼과 PATCH 비교 기준을 바꾸지 않는다.
  const [collection] = useState(initialCollection)
  const navigate = useNavigate()
  // 폼이 오류를 인라인으로 안내한다. 공통 토스트는 중복 표시하지 않고 진단 기록은 유지한다.
  const create = useCreateCollectionMutation(captureError)
  const update = useUpdateCollectionMutation(captureError)
  const handleClose = onClose
  const names = useCollectionsInfiniteQuery({})
  const { hasNextPage, isFetching, isError, fetchNextPage } = names
  useEffect(() => {
    if (hasNextPage && !isFetching && !isError) void fetchNextPage()
  }, [hasNextPage, isFetching, isError, fetchNextPage])
  const collections = (names.data?.pages ?? []).flatMap((page) =>
    (page.collections ?? []).map((item) => ({
      id: String(item.collectionId),
      name: item.name ?? '',
    })),
  )
  const nameCheckPending =
    names.isPending || isFetching || hasNextPage || isError

  return (
    <CollectionForm
      collection={collection}
      collections={collections}
      nameCheckPending={nameCheckPending}
      nameCheckFeedback={
        names.isError ? (
          <div className="flex items-center gap-3 pb-5">
            <p role="alert" className="typo-body-7 text-primary-200">
              {getErrorPresentation(names.error).message}
            </p>
            <Button
              size="sm"
              variant="neutral"
              disabled={isFetching}
              onClick={() => {
                void names.refetch()
              }}
            >
              다시 시도
            </Button>
          </div>
        ) : nameCheckPending ? (
          <p role="status" className="typo-body-7 text-primary-200 pb-5">
            불러오는 중…
          </p>
        ) : null
      }
      onClose={handleClose}
      onDiscard={() => navigate(ROUTES.saved, { replace: true })}
      onSubmitSuccess={() => {
        if (sessionVersion === getAuthSessionVersion()) handleClose()
      }}
      onSubmit={async (draft) => {
        if (collection) {
          await update.mutateAsync({
            collectionId: Number(collection.id),
            body: getChangedFields(draft, collection),
          })
        } else {
          if (!draft.color) throw new Error('A collection color is required')
          await create.mutateAsync({
            name: draft.name,
            description: draft.description,
            color: draft.color,
            visibility: draft.isPublic ? 'public' : 'private',
          })
        }
      }}
    />
  )
}

const useCollectionFormClose = (allowRestore: boolean) => {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = getCollectionReturn(allowRestore ? location.state : null)
  const handleClose = () => {
    if (returnTo.key) navigate(-1)
    else
      navigate(
        { pathname: returnTo.pathname, search: returnTo.search },
        { replace: true, state: returnTo.state },
      )
  }
  return handleClose
}
