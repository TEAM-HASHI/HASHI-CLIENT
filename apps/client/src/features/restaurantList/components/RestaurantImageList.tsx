import { RESTAURANT_IMAGE_SLOT_COUNT } from '@/features/restaurantList/constants'
import { DefaultImage } from '@/shared/components/defaultImage'

type RestaurantImageListProps = {
  images: string[]
  restaurantName: string
}

export const RestaurantImageList = ({
  images,
  restaurantName,
}: RestaurantImageListProps) => {
  const imageSlots = Array.from({ length: RESTAURANT_IMAGE_SLOT_COUNT })

  return (
    <span
      className="block w-full [scrollbar-width:none] overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      data-testid="restaurant-image-list"
    >
      <span className="flex w-max gap-2">
        {imageSlots.map((_, index) => {
          const image = images[index]

          return image ? (
            <img
              alt={`${restaurantName} 사진 ${index + 1}`}
              className="size-33.75 shrink-0 rounded-[5px] object-cover"
              key={`${image}-${index}`}
              src={image}
            />
          ) : (
            <DefaultImage
              aria-hidden="true"
              className="size-33.75 shrink-0 rounded-[5px]"
              data-testid="restaurant-image-placeholder"
              key={`placeholder-${index}`}
              logoSize="md"
            />
          )
        })}
      </span>
    </span>
  )
}
