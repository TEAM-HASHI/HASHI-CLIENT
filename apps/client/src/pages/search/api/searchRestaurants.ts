import { searchRestaurantFixtures } from '@/pages/search/mocks/searchRestaurants.mock'
import type {
  SearchRestaurant,
  SearchRestaurantsParams,
} from '@/pages/search/types'

const normalizeText = (text: string) => text.trim().toLowerCase()

const matchesKeyword = (restaurant: SearchRestaurant, keyword: string) => {
  const normalizedKeyword = normalizeText(keyword)

  if (!normalizedKeyword) {
    return false
  }

  return [restaurant.name, restaurant.tag, ...restaurant.keywords].some(
    (value) => normalizeText(value).includes(normalizedKeyword),
  )
}

const matchesCategory = (
  restaurant: SearchRestaurant,
  category: SearchRestaurantsParams['category'],
) => {
  return category === 'all' || restaurant.category === category
}

const sortRestaurants = (
  restaurants: SearchRestaurant[],
  sort: SearchRestaurantsParams['sort'],
) => {
  const nextRestaurants = [...restaurants]

  if (sort === 'popular') {
    return nextRestaurants.sort((first, second) => {
      return second.popularity - first.popularity
    })
  }

  if (sort === 'rating') {
    return nextRestaurants.sort((first, second) => {
      return second.rating - first.rating
    })
  }

  return nextRestaurants
}

export const searchRestaurants = async ({
  category,
  keyword,
  sort,
}: SearchRestaurantsParams) => {
  const restaurants = searchRestaurantFixtures.filter((restaurant) => {
    return (
      matchesKeyword(restaurant, keyword) &&
      matchesCategory(restaurant, category)
    )
  })

  return sortRestaurants(restaurants, sort)
}
