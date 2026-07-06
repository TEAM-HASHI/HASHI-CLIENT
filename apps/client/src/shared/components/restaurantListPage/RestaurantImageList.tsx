type RestaurantImageListProps = {
  images: string[]
  restaurantName: string
}

export const RestaurantImageList = ({
  images,
  restaurantName,
}: RestaurantImageListProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {images.map((image, index) => (
        <img
          alt={`${restaurantName} 사진 ${index + 1}`}
          className="size-[135px] shrink-0 rounded-[5px] object-cover"
          key={`${image}-${index}`}
          src={image}
        />
      ))}
    </div>
  )
}
