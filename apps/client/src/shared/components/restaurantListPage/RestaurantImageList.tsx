type RestaurantImageListProps = {
  images: string[]
  restaurantName: string
}

const RESTAURANT_IMAGE_SLOT_COUNT = 3

export const RestaurantImageList = ({
  images,
  restaurantName,
}: RestaurantImageListProps) => {
  const imageSlots = Array.from({ length: RESTAURANT_IMAGE_SLOT_COUNT })

  return (
    <div className="w-[353px] overflow-hidden">
      <div className="flex gap-2">
        {imageSlots.map((_, index) => {
          const image = images[index]

          return image ? (
            <img
              alt={`${restaurantName} 사진 ${index + 1}`}
              className="size-[135px] shrink-0 rounded-[5px] object-cover"
              key={`${image}-${index}`}
              src={image}
            />
          ) : (
            <span
              aria-hidden="true"
              className="bg-primary-100 size-[135px] shrink-0 rounded-[5px]"
              data-testid="restaurant-image-placeholder"
              key={`placeholder-${index}`}
            />
          )
        })}
      </div>
    </div>
  )
}
