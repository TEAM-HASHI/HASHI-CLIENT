import { CancelIcon } from '@hashi/hds-icons'
import { Button, Carousel, Dialog } from '@hashi/hds-ui'
import { useEffect, useState } from 'react'

import { RestaurantPhotoZoomImage } from '@/features/restaurantDetail/components/RestaurantPhotoZoomImage'
import type { RestaurantPhoto } from '@/features/restaurantDetail/types/restaurantPhoto'
import { getPhotoIndicatorState } from '@/features/restaurantDetail/utils/getPhotoIndicatorState'
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
  const [index, setIndex] = useState(initialIndex)
  const { dotCount, currentDot } = getPhotoIndicatorState(total, index)

  useEffect(() => {
    if (index >= photos.length - 2 && hasMore && !isLoading && !isError)
      onLoadMore()
  }, [index, photos.length, hasMore, isLoading, isError, onLoadMore])

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Content
        aria-label="식당 사진 상세보기"
        className="bg-cool-gray-900 fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none rounded-none border-0 p-0 text-white"
      >
        <Dialog.Title className="sr-only">식당 사진 상세보기</Dialog.Title>
        <Dialog.Close
          autoFocus
          aria-label="사진 상세보기 닫기"
          className="text-primary-100 z-raised absolute top-19.5 right-5 flex size-6 items-center justify-center"
        >
          <CancelIcon className="size-6" />
        </Dialog.Close>
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
      </Dialog.Content>
    </Dialog.Root>
  )
}
