import { CancelIcon } from '@hashi/hds-icons'
import { Carousel, IconButton } from '@hashi/hds-ui'

import type { NoticeImage } from '@/features/notice/types'
import { NoticeAttachmentImage } from '@/pages/noticeDetail/components/NoticeAttachmentImage'
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock'

interface NoticeImageViewerProps {
  images: NoticeImage[]
  initialIndex: number
  title: string
  onClose: () => void
}

// ponytail: 좌우 스와이프까지만 지원한다. 핀치 확대·축소는 HASHI-213에서 공용 뷰어로 통합한다.
export const NoticeImageViewer = ({
  images,
  initialIndex,
  title,
  onClose,
}: NoticeImageViewerProps) => {
  useBodyScrollLock(true)

  return (
    <div
      aria-label="공지 이미지 크게 보기"
      aria-modal="true"
      className="bg-cool-gray-900 z-modal fixed inset-0 overflow-hidden"
      role="dialog"
    >
      <IconButton
        aria-label="공지 이미지 크게 보기 닫기"
        className="text-primary-100 z-raised absolute top-[78px] right-5 size-6"
        onClick={onClose}
        size="xs"
      >
        <CancelIcon className="size-6" />
      </IconButton>

      <Carousel.Root
        aria-label="공지 첨부 이미지 목록"
        className="absolute inset-0"
        defaultIndex={initialIndex}
      >
        <Carousel.Viewport className="absolute top-[139px] bottom-[139px] overflow-y-hidden">
          <Carousel.Track>
            {images.map((image, index) => (
              <Carousel.Item key={`${image.url}-${index}`}>
                <NoticeAttachmentImage
                  alt={`${title} 첨부 이미지 ${index + 1}`}
                  src={image.url}
                />
              </Carousel.Item>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator
          activeDotClassName="bg-cool-gray-200 h-1 w-3"
          className="bottom-10 gap-[5px]"
          dotClassName="bg-cool-gray-200 size-1"
        />
      </Carousel.Root>
    </div>
  )
}
