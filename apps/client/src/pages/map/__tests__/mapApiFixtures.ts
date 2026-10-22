import type {
  MapNewQuery,
  MapPageRequest,
  MapRegions,
  MapRestaurantPage,
} from '@/pages/map/api/mapApiTypes'
import {
  MAP_PREVIEW_AREAS,
  MAP_PREVIEW_RESTAURANTS,
} from '@/pages/map/data/mapPreviewRestaurants'

// Existing artwork/names are test fixtures only; production never falls back to them.
export const mapFixtureBounds = {
  north: 35.73,
  south: 35.64,
  west: 139.68,
  east: 139.81,
}
export const mapFixtureRestaurants = MAP_PREVIEW_RESTAURANTS.map(
  (restaurant, index) => ({
    ...restaurant,
    id: String(index + 1),
    areaCode: String(
      MAP_PREVIEW_AREAS.findIndex(({ code }) => code === restaurant.areaCode) +
        1,
    ),
    validUntil: '2099-01-01T00:00:00Z',
    attributions: [
      { displayName: '좌표 제공자', uri: 'https://example.com/credits' },
    ],
  }),
)
export const mapRegionsFixture: MapRegions = {
  initialBounds: mapFixtureBounds,
  queryLimits: {
    supportedBounds: { north: 40, south: 30, west: 130, east: 150 },
    maxLatitudeSpan: 2,
    maxLongitudeSpan: 2,
  },
  regions: MAP_PREVIEW_AREAS.map((area, index) => ({
    ...area,
    code: String(index + 1),
    restaurantCount: mapFixtureRestaurants.filter(
      ({ areaCode }) => areaCode === String(index + 1),
    ).length,
    cameraBounds: {
      north: area.position.lat + 0.01,
      south: area.position.lat - 0.01,
      west: area.position.lng - 0.01,
      east: area.position.lng + 0.01,
    },
  })),
}

export const createMapPageFixture = (
  request: MapPageRequest = { ...mapFixtureBounds, sort: 'recommend' },
): MapRestaurantPage => {
  const query: MapNewQuery =
    'south' in request && request.south !== undefined
      ? (request as MapNewQuery)
      : { ...mapFixtureBounds, sort: request.sort ?? 'recommend' }
  const restaurants = mapFixtureRestaurants
    .filter(
      (restaurant) =>
        (!query.placeType || restaurant.category === query.placeType) &&
        (!query.mapRegionId ||
          restaurant.areaCode === String(query.mapRegionId)) &&
        (!query.keyword ||
          `${restaurant.name} ${restaurant.menuKeywords.join(' ')}`.includes(
            query.keyword,
          )),
    )
    .sort((left, right) =>
      query.sort === 'rating'
        ? right.rating - left.rating
        : query.sort === 'reviews'
          ? right.reviewCount - left.reviewCount
          : left.recommendationRank - right.recommendationRank,
    )
  return {
    restaurants,
    hasNext: false,
    querySessionId: '123e4567-e89b-12d3-a456-426614174000',
    expiresAt: '2099-01-01T00:00:00Z',
    rankingAsOf: '2026-10-19T00:00:00Z',
    query,
    searchResult: query.keyword
      ? {
          totalCount: restaurants.length,
          bounds: restaurants.length
            ? {
                north: Math.max(
                  ...restaurants.map(({ position }) => position.lat),
                ),
                south: Math.min(
                  ...restaurants.map(({ position }) => position.lat),
                ),
                west: Math.min(
                  ...restaurants.map(({ position }) => position.lng),
                ),
                east: Math.max(
                  ...restaurants.map(({ position }) => position.lng),
                ),
              }
            : null,
        }
      : undefined,
  }
}

export const createMapLocationFixture = (id: string) => {
  const restaurant = mapFixtureRestaurants.find((item) => item.id === id)
  if (!restaurant) throw new Error(`Unknown restaurant fixture: ${id}`)
  return {
    position: restaurant.position,
    validUntil: restaurant.validUntil,
    attributions: restaurant.attributions,
  }
}

export const createMapSummaryFixture = (id: number) => {
  const restaurant = mapFixtureRestaurants.find(
    (item) => item.id === String(id),
  )
  if (!restaurant) throw new Error(`Unknown restaurant fixture: ${id}`)
  return {
    restaurantId: id,
    name: restaurant.name,
    address: '도쿄',
    imageUrls: restaurant.images,
    reservationFee: 0,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
  }
}

export const createMapStoreFixture = (id: number) => ({
  restaurantId: id,
  description:
    mapFixtureRestaurants.find((item) => item.id === String(id))?.description ??
    '',
  businessHours: [],
})
