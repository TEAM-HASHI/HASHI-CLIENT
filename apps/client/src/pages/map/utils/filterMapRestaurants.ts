import type { MapBounds, MapConditions, MapRestaurant } from '@/pages/map/types'

export const filterMapRestaurants = (
  restaurants: readonly MapRestaurant[],
  conditions: MapConditions,
  bounds: MapBounds | null = null,
) => {
  const keyword = conditions.keyword.trim().toLocaleLowerCase()

  return restaurants
    .filter((restaurant) => {
      const matchesKeyword = [restaurant.name, ...restaurant.menuKeywords].some(
        (value) => value.toLocaleLowerCase().includes(keyword),
      )
      return (
        (!bounds ||
          (restaurant.position.lat >= bounds.south &&
            restaurant.position.lat <= bounds.north &&
            (bounds.west <= bounds.east
              ? restaurant.position.lng >= bounds.west &&
                restaurant.position.lng <= bounds.east
              : restaurant.position.lng >= bounds.west ||
                restaurant.position.lng <= bounds.east))) &&
        matchesKeyword &&
        (conditions.category === 'all' ||
          restaurant.category === conditions.category) &&
        (!conditions.areaCode || restaurant.areaCode === conditions.areaCode)
      )
    })
    .sort((a, b) => {
      const difference =
        conditions.sort === 'rating'
          ? b.rating - a.rating
          : conditions.sort === 'reviews'
            ? b.reviewCount - a.reviewCount
            : 0
      return difference || a.recommendationRank - b.recommendationRank
    })
}
