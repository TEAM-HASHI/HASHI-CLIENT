import { BackIcon, PlusIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import type { ReactNode, Ref } from 'react'

type SavedPageLayoutProps = {
  detail: boolean
  title?: string
  description?: string
  count?: number
  panelHeader?: ReactNode
  headerActions?: ReactNode
  filters?: ReactNode
  onBack: () => void
  onCreate?: () => void
  scrollRef?: Ref<HTMLDivElement>
  scrollKey: string
  children: ReactNode
  embedded?: boolean
}

/** 조회와 fixture에서 동일한 고정 헤더·내부 스크롤 영역을 사용한다. */
export const SavedPageLayout = ({
  detail,
  title,
  description,
  count,
  panelHeader,
  headerActions,
  filters,
  onBack,
  onCreate,
  scrollRef,
  scrollKey,
  children,
  embedded = false,
}: SavedPageLayoutProps) => (
  <div
    data-dropdown-boundary
    className={
      embedded
        ? 'flex h-full flex-col overflow-hidden bg-white'
        : 'flex h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] flex-col overflow-hidden bg-white pt-[var(--safe-area-top,0px)]'
    }
  >
    <div
      data-testid="saved-fixed-header"
      className="relative z-10 shrink-0 bg-white"
    >
      {panelHeader ?? (
        <>
          {(!embedded || detail) && (
            <div className="relative">
              <Header
                title={
                  <h1 className="max-w-full truncate" title={title}>
                    {detail ? title : '저장 컬렉션'}
                  </h1>
                }
                subtitle={detail ? '저장한 장소' : undefined}
                leftAction={
                  detail ? (
                    <IconButton
                      size="xs"
                      aria-label="컬렉션 목록으로 돌아가기"
                      onClick={onBack}
                    >
                      <BackIcon className="size-6" />
                    </IconButton>
                  ) : undefined
                }
                contentClassName={
                  detail
                    ? '[&>div:first-child]:typo-sub-header-2 right-12 left-12'
                    : undefined
                }
              />
              {headerActions && (
                <div className="absolute top-7 right-5 flex items-center gap-1">
                  {headerActions}
                </div>
              )}
            </div>
          )}
          {detail && description && (
            <p className="typo-body-6 text-cool-gray-400 px-5 pt-2 leading-[1.36] [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
              {description}
            </p>
          )}
          <div
            className={
              embedded && !detail
                ? 'flex items-center justify-between gap-2 px-5 pt-2 pb-1'
                : 'flex h-11.5 items-center justify-between gap-2 px-5'
            }
          >
            <p
              className={`${embedded && !detail ? 'typo-body-3' : 'typo-body-5'} text-primary-200 shrink-0`}
            >
              {count !== undefined && (
                <>
                  {embedded && !detail ? '컬렉션 ' : '총 '}
                  {count}
                  {detail ? '곳' : '개'}
                </>
              )}
            </p>
            {filters}
          </div>
        </>
      )}
      {!detail && onCreate && (
        <div className="px-5">
          <button
            type="button"
            onClick={onCreate}
            className="border-warm-gray-50 flex w-full items-center gap-3 border-b py-4.5 text-left"
          >
            <span className="bg-primary-100 flex size-12.5 shrink-0 items-center justify-center rounded-[5px]">
              <PlusIcon
                aria-hidden="true"
                className="text-primary-200 size-8 shrink-0"
              />
            </span>
            <span className="typo-body-3 text-primary-200">
              새 컬렉션 만들기
            </span>
          </button>
        </div>
      )}
    </div>
    <section
      ref={scrollRef}
      key={scrollKey}
      aria-label={detail ? '저장 식당 목록' : '컬렉션 목록'}
      tabIndex={0}
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
    >
      {children}
    </section>
  </div>
)
