import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getNoticeDetail } from '@/features/notice/api/getNoticeDetail'
import { noticeQueryKeys } from '@/features/notice/noticeQueryKeys'
import { formatNoticeLastUpdatedDate } from '@/features/notice/utils/formatNoticeDate'
import { NotFoundPage } from '@/pages/notFound'
import { NoticeAttachmentImage } from '@/pages/noticeDetail/components/NoticeAttachmentImage'
import { NoticeContent } from '@/pages/noticeDetail/components/NoticeContent'
import { NoticeImageViewer } from '@/pages/noticeDetail/components/NoticeImageViewer'
import { checkIsNotFoundError } from '@/shared/api/apiError'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const parseNoticeId = (value: string | undefined) => {
  const noticeId = Number(value)

  return Number.isSafeInteger(noticeId) && noticeId > 0 ? noticeId : null
}

export const NoticeDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fromNoticeList =
    (location.state as { fromNoticeList?: boolean } | null)?.fromNoticeList ===
    true
  const params = useParams<{ noticeId: string }>()
  const noticeId = parseNoticeId(params.noticeId)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const noticeQuery = useQuery({
    queryKey: noticeQueryKeys.detail(noticeId),
    queryFn: () => getNoticeDetail(noticeId as number),
    enabled: noticeId !== null,
  })

  if (noticeId === null || checkIsNotFoundError(noticeQuery.error)) {
    return <NotFoundPage />
  }

  if (noticeQuery.error) {
    throw noticeQuery.error
  }

  const notice = noticeQuery.data
  const images =
    notice?.images.map(({ image }) => {
      const source = image?.status === 'READY' ? image.defaultSource : null
      return {
        url: source?.url ?? null,
        width: source?.width ?? 1,
        height: source?.height ?? 1,
      }
    }) ?? []

  return (
    <div className="app-mobile-bottom-nav-content bg-white pt-18.75">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
        leftAction={
          <IconButton
            aria-label="뒤로가기"
            onClick={() =>
              fromNoticeList
                ? navigate(-1)
                : navigate(ROUTES.notices, { replace: true })
            }
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="공지사항"
      />
      {notice ? (
        <article className="px-5 pb-10">
          <div className="flex min-h-25 flex-col justify-center gap-2 py-6">
            <h1 className="typo-sub-header-2 leading-[1.27] break-keep text-black">
              {notice.title}
            </h1>
            <p className="typo-body-6 text-primary-200 leading-[1.38]">
              {formatNoticeLastUpdatedDate(notice)}
            </p>
          </div>
          <NoticeContent body={notice.body} />
          {images.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-2">
              {images.map((image, index) => (
                <li key={`${image.url}-${index}`}>
                  <button
                    aria-label={`첨부 이미지 ${index + 1} 크게 보기`}
                    className="block w-full overflow-hidden"
                    onClick={() => setViewerIndex(index)}
                    style={{ aspectRatio: `${image.width} / ${image.height}` }}
                    type="button"
                  >
                    <NoticeAttachmentImage
                      alt={`${notice.title} 첨부 이미지 ${index + 1}`}
                      src={image.url}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {viewerIndex !== null ? (
            <NoticeImageViewer
              images={images}
              initialIndex={viewerIndex}
              onClose={() => setViewerIndex(null)}
              title={notice.title}
            />
          ) : null}
        </article>
      ) : (
        <LoadingScreen className="min-h-[calc(100dvh-159px)]" />
      )}
    </div>
  )
}
