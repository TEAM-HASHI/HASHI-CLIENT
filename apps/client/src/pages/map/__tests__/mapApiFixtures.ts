import type {
  MapNewQuery,
  MapPageRequest,
  MapRegions,
  MapRestaurantPage,
} from '@/pages/map/api/mapApiTypes'
import type { MapRestaurant } from '@/pages/map/types'
import photo1 from '@/pages/map/__tests__/fixtures/map-photo-1.png'
import photo2 from '@/pages/map/__tests__/fixtures/map-photo-2.png'
import photo3 from '@/pages/map/__tests__/fixtures/map-photo-3.png'

const mapFixtureAreas = [
  {
    code: '1',
    name: '신주쿠',
    position: { lat: 35.6938, lng: 139.7034 },
  },
  {
    code: '2',
    name: '시부야',
    position: { lat: 35.6595, lng: 139.7005 },
  },
  { code: '3', name: '긴자', position: { lat: 35.6717, lng: 139.765 } },
  { code: '4', name: '우에노', position: { lat: 35.7142, lng: 139.7774 } },
  {
    code: '5',
    name: '아사쿠사',
    position: { lat: 35.7148, lng: 139.7967 },
  },
] as const

const restaurantDefaults = {
  saveCount: 1234,
  hours: '평일 · 12:00~19:00',
  price: 'JPY 1,000~2,000',
  description: '도쿄에서 즐기는 식당입니다.',
  address: '도쿄',
  validUntil: '2099-01-01T00:00:00Z',
  attributions: [
    { displayName: '좌표 제공자', uri: 'https://example.com/credits' },
  ],
}

export const mapFixtureRestaurants = [
  {
    ...restaurantDefaults,
    id: '1',
    name: '코코네 돈카츠 신도심점',
    areaCode: '1',
    category: 'restaurant',
    cuisine: '돈카츠',
    rating: 4.8,
    reviewCount: 124,
    recommendationRank: 1,
    menuKeywords: ['돈카츠', '튀김'],
    images: [photo1, photo2, photo3],
    position: { lat: 35.694, lng: 139.703 },
  },
  {
    ...restaurantDefaults,
    id: '2',
    name: '야키니쿠 리키마루',
    areaCode: '2',
    category: 'restaurant',
    cuisine: '야키니쿠',
    rating: 4.8,
    reviewCount: 256,
    recommendationRank: 2,
    menuKeywords: ['고기', '야키니쿠'],
    images: [photo1, photo2, photo1],
    position: { lat: 35.6605, lng: 139.7015 },
  },
  {
    ...restaurantDefaults,
    id: '3',
    name: '카츠카츠',
    areaCode: '4',
    category: 'restaurant',
    cuisine: '돈카츠',
    rating: 4.6,
    reviewCount: 78,
    recommendationRank: 3,
    menuKeywords: ['돈카츠'],
    images: [photo1, photo2, photo3],
    position: { lat: 35.715, lng: 139.778 },
  },
  {
    ...restaurantDefaults,
    id: '4',
    name: '히마와리 스시 신도심점',
    areaCode: '3',
    category: 'restaurant',
    cuisine: '초밥',
    rating: 4.9,
    reviewCount: 310,
    recommendationRank: 4,
    menuKeywords: ['스시', '초밥', '연어'],
    images: [photo3, photo2, photo1],
    position: { lat: 35.672, lng: 139.765 },
  },
  {
    ...restaurantDefaults,
    id: '5',
    name: '도쿄 카페 미리보기',
    areaCode: '2',
    category: 'cafe',
    cuisine: '카페',
    rating: 4.5,
    reviewCount: 42,
    recommendationRank: 5,
    menuKeywords: ['커피', '라떼'],
    images: [],
    position: { lat: 35.6585, lng: 139.6995 },
  },
  {
    ...restaurantDefaults,
    id: '6',
    name: '아사쿠사 주점 미리보기',
    areaCode: '5',
    category: 'bar',
    cuisine: '주점',
    rating: 4.7,
    reviewCount: 85,
    recommendationRank: 6,
    menuKeywords: ['맥주', '사케'],
    images: [],
    position: { lat: 35.7145, lng: 139.7965 },
  },
  {
    ...restaurantDefaults,
    id: '7',
    name: '만약 식당명이 길어진다면 한 줄까지만 표시하는 도쿄 식당 미리보기',
    areaCode: '1',
    category: 'restaurant',
    cuisine: '야키니쿠',
    rating: 4.3,
    reviewCount: 18,
    recommendationRank: 7,
    menuKeywords: ['고기'],
    images: [photo1, photo2],
    position: { lat: 35.6955, lng: 139.705 },
  },
] satisfies MapRestaurant[]

export const mapFixtureBounds = {
  north: 35.73,
  south: 35.64,
  west: 139.68,
  east: 139.81,
}
export const mapRegionsFixture: MapRegions = {
  initialBounds: mapFixtureBounds,
  queryLimits: {
    supportedBounds: { north: 40, south: 30, west: 130, east: 150 },
    maxLatitudeSpan: 2,
    maxLongitudeSpan: 2,
  },
  regions: mapFixtureAreas.map((area) => ({
    ...area,
    restaurantCount: mapFixtureRestaurants.filter(
      ({ areaCode }) => areaCode === area.code,
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
