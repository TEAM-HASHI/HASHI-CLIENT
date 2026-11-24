import { useState } from 'react'

import { NoticeAttachmentImage } from '@/features/notice/components/NoticeAttachmentImage'
import { NoticeContent } from '@/features/notice/components/NoticeContent'
import { NoticeImageViewer } from '@/features/notice/components/NoticeImageViewer'
import type { ServiceNotice } from '@/pages/notifications/types'

export const ServiceNoticeDetail = ({ notice }: { notice: ServiceNotice }) => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  return (
    <article className="px-5 pb-10">
      <div className="flex min-h-25 flex-col justify-center gap-2 py-6">
        <h1 className="typo-sub-header-2 leading-[1.27] break-keep text-black">
          {notice.title}
        </h1>
        <p className="typo-body-6 text-primary-200 leading-[1.38]">
          {notice.displayDate}
        </p>
      </div>
      <NoticeContent body={notice.body} />
      <ul className="mt-5 flex flex-col gap-2">
        {notice.images.map((image, index) => (
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
                className="object-cover"
                src={image.url}
              />
            </button>
          </li>
        ))}
      </ul>
      {viewerIndex !== null ? (
        <NoticeImageViewer
          images={notice.images}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          title={notice.title}
        />
      ) : null}
    </article>
  )
}
