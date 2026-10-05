import { Thumbnail } from '@hashi/hds-ui'

type RestaurantImageListProps = {
  images: string[]
  restaurantName: string
}

export const RestaurantImageList = ({
  images,
  restaurantName,
}: RestaurantImageListProps) => {
  const visibleImages = images.slice(0, 5)

  return (
    <span
      className="block w-full [scrollbar-width:none] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
      data-testid="restaurant-image-list"
    >
      <span className="flex w-max gap-2">
        {visibleImages.length > 0 ? (
          visibleImages.map((image, index) => (
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
