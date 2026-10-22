import { CancelIcon } from '@hashi/hds-icons'
import { Carousel, Dialog } from '@hashi/hds-ui'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'

interface MapPhotoViewerProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export const MapPhotoViewer = ({
  images,
  initialIndex,
  onClose,
}: MapPhotoViewerProps) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open) onClose()
    }}
  >
    <Dialog.Content
      aria-label="식당 사진 상세보기"
      className="bg-cool-gray-900 fixed inset-0 mx-auto h-dvh w-full max-w-[var(--app-mobile-max-width,430px)] rounded-none p-0"
    >
      <Dialog.Title className="sr-only">식당 사진 상세보기</Dialog.Title>
      <Dialog.Close
        aria-label="식당 사진 상세보기 닫기"
        className="z-raised absolute top-[calc(32px+var(--safe-area-top,0px))] right-5 flex size-11 items-center justify-center text-white"
      >
        <CancelIcon className="size-6" />
      </Dialog.Close>
      <Carousel.Root
        aria-label="식당 사진 목록"
        defaultIndex={initialIndex}
        className="relative h-full w-full"
      >
        <Carousel.Viewport className="absolute top-[16%] bottom-[16%]">
          <Carousel.Track className="h-full">
            {images.map((src, index) => (
              <Carousel.Item key={`${src}-${index}`}>
                <RestaurantImage
                  src={src}
                  className="size-full object-contain"
                  markSize="lg"
                />
              </Carousel.Item>
            ))}
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.Indicator
          className="bottom-10"
          dotClassName="bg-warm-gray-300"
          activeDotClassName="bg-warm-gray-300"
        />
      </Carousel.Root>
    </Dialog.Content>
  </Dialog.Root>
)
