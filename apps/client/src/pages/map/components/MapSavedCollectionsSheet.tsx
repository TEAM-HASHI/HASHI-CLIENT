import { BottomSheet, Button } from '@hashi/hds-ui'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { getCollectionDetailPath } from '@/app/router/routePaths'
import { useCollectionsInfiniteQuery } from '@/pages/saved/queries/useCollectionsInfiniteQuery'
import { mapCollectionSummary } from '@/pages/saved/utils/collectionReadAdapters'
import { getErrorPresentation } from '@/shared/api/errorPresentation'

type MapSavedCollectionsSheetProps = {
  open: boolean
  onClose: () => void
}

export const MapSavedCollectionsSheet = ({
  open,
  onClose,
}: MapSavedCollectionsSheetProps) => {
  const navigate = useNavigate()
  const query = useCollectionsInfiniteQuery(open ? { size: 20 } : null)
  const collections = (query.data?.pages ?? []).flatMap((page) =>
    (page.collections ?? []).map(mapCollectionSummary),
  )

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="내 컬렉션"
    >
      <div className="max-h-[60dvh] overflow-y-auto pb-6">
        {query.isPending && (
          <p role="status" className="py-4">
            불러오는 중…
          </p>
        )}
        {query.error && (
          <div className="flex flex-col gap-3 py-4">
            <p role="alert">{getErrorPresentation(query.error).message}</p>
            <Button size="sm" onClick={() => void query.refetch()}>
              다시 시도
            </Button>
          </div>
        )}
        {query.isSuccess && collections.length === 0 && (
          <p className="py-6 text-center">아직 만든 컬렉션이 없어요.</p>
        )}
        <ul aria-label="내 컬렉션">
          {collections.map((collection) => (
            <li key={collection.id} className="border-warm-gray-50 border-b">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 py-4 text-left"
                onClick={() => {
                  onClose()
                  navigate(getCollectionDetailPath(collection.id))
                }}
              >
                <span className="truncate">{collection.name}</span>
                <span className="shrink-0 text-sm">
                  {collection.savedCount}개
                </span>
              </button>
            </li>
          ))}
        </ul>
        {query.hasNextPage && (
          <Button
            size="sm"
            variant="neutral"
            disabled={query.isFetching}
            onClick={() => void query.fetchNextPage()}
          >
            더 보기
          </Button>
        )}
        <button
          type="button"
          className="text-primary-200 mt-4 w-full py-3 text-center"
          onClick={() => {
            onClose()
            navigate(ROUTES.saved)
          }}
        >
          컬렉션 전체 보기
        </button>
      </div>
    </BottomSheet>
  )
}
