import { Carousel } from '@hashi/hds-ui'
import { useState } from 'react'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'
import { cn } from '@/shared/utils'

const MAX_REPRESENTATIVE_IMAGES = 10

interface RestaurantDetailHeroProps {
  imageUrls: string[]
}

export const RestaurantDetailHero = ({
  imageUrls,
}: RestaurantDetailHeroProps) => {
  const images = imageUrls.slice(0, MAX_REPRESENTATIVE_IMAGES)
  const [index, setIndex] = useState(0)
  const currentIndex = Math.min(index, Math.max(images.length - 1, 0))
  const slideCount = Math.max(images.length, 1)
  const dotCount = Math.min(images.length, 6)
  const currentDot = Math.min(currentIndex, Math.max(dotCount - 1, 0))

  return (
    <Carousel.Root
      aria-label="식당 이미지"
      className="bg-secondary-200 h-58.5"
      index={currentIndex}
      onIndexChange={setIndex}
    >
      <Carousel.Viewport className="size-full">
        <Carousel.Track>
          {Array.from({ length: slideCount }, (_, index) => {
            const imageUrl = images[index]

            return (
              <Carousel.Item
                aria-label={`식당 이미지 ${index + 1}`}
                key={imageUrl ?? `restaurant-image-placeholder-${index}`}
              >
                <RestaurantImage
                  className="size-full object-cover"
                  markSize="lg"
                  src={imageUrl}
                />
              </Carousel.Item>
            )
          })}
        </Carousel.Track>
      </Carousel.Viewport>
      {dotCount > 0 && (
        <div
          role="img"
          aria-label="대표 이미지 위치"
          className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-[5px]"
        >
          {Array.from({ length: dotCount }, (_, dotIndex) => (
            <span
              key={dotIndex}
              aria-hidden="true"
              data-current={dotIndex === currentDot || undefined}
              className={cn(
                'bg-warm-gray-300 block h-1 shrink-0 rounded-full transition-[width] duration-150 motion-reduce:transition-none',
                dotIndex === currentDot ? 'w-3' : 'w-1',
              )}
            />
          ))}
        </div>
      )}
    </Carousel.Root>
  )
}
