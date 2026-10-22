import type {
  CollectionCategory,
  CollectionSort,
  SavedCollection,
  SavedRestaurant,
} from '@/pages/saved/types'

export const selectCollections = (collections: readonly SavedCollection[]) =>
  [...collections].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )

export const selectRestaurants = (
  collection: SavedCollection,
  restaurants: readonly SavedRestaurant[],
  sort: CollectionSort = 'latest',
  category: CollectionCategory = 'all',
): SavedRestaurant[] => {
  const byId = new Map(
    restaurants.map((restaurant) => [restaurant.id, restaurant]),
  )
  return collection.restaurants
    .flatMap((saved) => {
      const restaurant = byId.get(saved.restaurantId)
      return restaurant?.visibility === 'visible' &&
        (category === 'all' || restaurant.category === category)
        ? [{ restaurant, savedAt: Date.parse(saved.savedAt) }]
        : []
    })
    .sort((a, b) => {
      const difference =
        sort === 'rating'
          ? b.restaurant.rating - a.restaurant.rating
          : sort === 'reviews'
            ? b.restaurant.reviewCount - a.restaurant.reviewCount
            : 0
      return difference || b.savedAt - a.savedAt
    })
    .map(({ restaurant }) => restaurant)
}
