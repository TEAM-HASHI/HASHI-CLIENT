import { Carousel } from '@hashi/hds-ui'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'

interface RestaurantDetailHeroProps {
  imageUrls: string[]
}

export const RestaurantDetailHero = ({
  imageUrls,
}: RestaurantDetailHeroProps) => {
  const slideCount = imageUrls.length > 0 ? imageUrls.length : 1

  return (
    <Carousel.Root
      aria-label="식당 이미지"
      className="bg-secondary-200 h-[234px]"
    >
      <Carousel.Viewport className="size-full">
        <Carousel.Track>
          {Array.from({ length: slideCount }, (_, index) => {
            const imageUrl = imageUrls[index]

            return (
              <Carousel.Item
                aria-label={`식당 이미지 ${index + 1}`}
                key={imageUrl ?? `restaurant-image-placeholder-${index}`}
              >
                <RestaurantImage
                  className="size-full object-cover"
                  defaultImageTestId="restaurant-detail-hero-default-image"
                  logoSize="lg"
                  src={imageUrl}
                />
              </Carousel.Item>
            )
          })}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicator
        activeDotClassName="h-1 w-3 bg-warm-gray-300"
        className="bottom-4 gap-[5px]"
        dotClassName="size-1 bg-warm-gray-300"
      />
    </Carousel.Root>
  )
}
