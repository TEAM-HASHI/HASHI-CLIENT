import { Thumbnail } from '@hashi/hds-ui'

type RestaurantImageListProps = {
  images: string[]
  restaurantName: string
}

export const RestaurantImageList = ({
  images,
  restaurantName,
}: RestaurantImageListProps) => {
  return (
    <span
      className="block w-full scrollbar-none overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      data-testid="restaurant-image-list"
    >
      <span className="flex w-max gap-2">
        {images.length > 0 ? (
          images.map((image, index) => (
            <Thumbnail
              alt={`${restaurantName} 사진 ${index + 1}`}
              key={`${image}-${index}`}
              size="lg"
              src={image}
            />
          ))
        ) : (
          <Thumbnail alt="" aria-hidden="true" size="lg" />
        )}
      </span>
    </span>
  )
}
