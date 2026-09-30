import { CancelIcon } from '@hashi/hds-icons'
import { Button, Carousel, IconButton } from '@hashi/hds-ui'
import { useEffect, useRef, useState } from 'react'

import { RestaurantPhotoZoomImage } from '@/features/restaurantDetail/components/RestaurantPhotoZoomImage'
import type { RestaurantPhoto } from '@/features/restaurantDetail/types/restaurantPhoto'
import { cn } from '@/shared/utils'

interface RestaurantPhotoViewerProps {
  photos: RestaurantPhoto[]
  total: number
  initialIndex: number
  hasMore: boolean
  isLoading: boolean
  isError: boolean
  onLoadMore: () => void
  onClose: () => void
}

export const RestaurantPhotoViewer = ({
  photos,
  total,
  initialIndex,
  hasMore,
  isLoading,
  isError,
  onLoadMore,
  onClose,
}: RestaurantPhotoViewerProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(initialIndex)
  const dotCount = Math.min(total, 6)
  const currentDot =
    total > 0
      ? Math.min(dotCount - 1, Math.floor((index * dotCount) / total))
      : 0

  useEffect(() => {
    const dialog = dialogRef.current
    const focused = document.activeElement
    const scrollY = window.scrollY
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }
    dialog?.showModal()
    Object.assign(document.body.style, {
      overflow: 'hidden',
      position: 'fixed',
      top: `-${scrollY}px`,
      width: '100%',
    })
    return () => {
      dialog?.close()
      Object.assign(document.body.style, previous)
      if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }, [])

  useEffect(() => {
    if (index >= photos.length - 2 && hasMore && !isLoading && !isError)
      onLoadMore()
  }, [index, photos.length, hasMore, isLoading, isError, onLoadMore])

  return (
    <dialog
      ref={dialogRef}
      aria-label="식당 사진 상세보기"
      className="bg-cool-gray-900 fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 p-0 text-white"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <IconButton
        autoFocus
        aria-label="사진 상세보기 닫기"
        className="text-primary-100 z-raised absolute top-19.5 right-5"
        onClick={onClose}
        size="xs"
      >
        <CancelIcon className="size-6" />
      </IconButton>
      <Carousel.Root
        aria-label="식당 사진"
        className="absolute inset-x-0 top-34.75 bottom-34.75"
        index={index}
        onIndexChange={setIndex}
      >
        <Carousel.Viewport className="h-full">
          <Carousel.Track>
            {photos.map((photo, photoIndex) => (
              <Carousel.Item key={photo.id}>
                <RestaurantPhotoZoomImage
                  key={`${photo.id}-${photoIndex === index}`}
                  src={photo.imageUrl}
                />
              </Carousel.Item>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
      </Carousel.Root>
      {isError && (
        <div className="absolute inset-x-5 bottom-20 text-center">
          <Button onClick={onLoadMore}>다시 시도</Button>
        </div>
      )}
      {isLoading && (
        <span role="status" className="sr-only">
          사진을 불러오는 중입니다.
        </span>
      )}
      <div
        aria-label={`${index + 1} / ${total}`}
        className="absolute inset-x-0 bottom-10 flex justify-center gap-1.75"
      >
        {Array.from({ length: dotCount }, (_, dotIndex) => (
          <span
            aria-hidden="true"
            key={dotIndex}
            className={cn(
              'bg-warm-gray-300 h-1 rounded-full',
              dotIndex === currentDot ? 'w-3' : 'w-1',
            )}
          />
        ))}
      </div>
    </dialog>
  )
}
