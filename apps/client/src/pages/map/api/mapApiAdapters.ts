import type {
  MapApiSort,
  MapNewQuery,
  MapPageResponse,
  MapRegions,
  MapRegionsResponse,
  MapRestaurantLocation,
  MapRestaurantPage,
} from '@/pages/map/api/mapApiTypes'
import type { MapBounds, MapCategory, MapRestaurant } from '@/pages/map/types'

const invalidResponse = (field: string): never => {
  throw new Error(`Invalid map API response: ${field}`)
}

export const readMapObject = (
  value: unknown,
  field: string,
): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalidResponse(field)
  return value as Record<string, unknown>
}

const readString = (value: unknown, field: string): string =>
  typeof value === 'string' && value.trim() ? value : invalidResponse(field)

const readNumber = (value: unknown, field: string): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? value
    : invalidResponse(field)

export const readMapId = (value: unknown, field: string): number => {
  const id = readNumber(value, field)
  return Number.isSafeInteger(id) && id > 0 ? id : invalidResponse(field)
}

const readCount = (value: unknown, field: string): number => {
  const count = readNumber(value, field)
  return Number.isSafeInteger(count) && count >= 0
    ? count
    : invalidResponse(field)
}

const readTimestamp = (value: unknown, field: string): string => {
  const timestamp = readString(value, field)
  return Number.isFinite(Date.parse(timestamp)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp)
    ? timestamp
    : invalidResponse(field)
}

const readArray = (value: unknown, field: string): unknown[] =>
  Array.isArray(value) ? value : invalidResponse(field)

const readOptionalText = (value: unknown): string =>
  typeof value === 'string' ? value : ''

export const readMapBounds = (
  value: unknown,
  field: string,
  allowPoint = false,
): MapBounds => {
  const bounds = readMapObject(value, field)
  const south = readNumber(bounds.south, `${field}.south`)
  const north = readNumber(bounds.north, `${field}.north`)
  const west = readNumber(bounds.west, `${field}.west`)
  const east = readNumber(bounds.east, `${field}.east`)
  if (
    south < -90 ||
    north > 90 ||
    west < -180 ||
    east > 180 ||
    (allowPoint ? south > north || west > east : south >= north || west >= east)
  ) {
    return invalidResponse(field)
  }
  return { south, north, west, east }
}

const readPosition = (value: unknown, field: string) => {
  const position = readMapObject(value, field)
  const lat = readNumber(position.latitude, `${field}.latitude`)
  const lng = readNumber(position.longitude, `${field}.longitude`)
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
    return invalidResponse(field)
  return { lat, lng }
}

const readPlaceType = (value: unknown): MapCategory => {
  if (value === 'restaurant' || value === 'cafe' || value === 'bar')
    return value
  return invalidResponse('placeType')
}

const readSort = (value: unknown): MapApiSort => {
  if (value === 'recommend' || value === 'rating' || value === 'reviews')
    return value
  return invalidResponse('query.sort')
}

const GENRES = [
  'sushi',
  'noodle',
  'rice-bowl',
  'nabe',
  'fried',
  'grill',
  'etc',
] as const
const readGenre = (value: unknown): NonNullable<MapNewQuery['genre']> => {
  const genre = GENRES.find((candidate) => candidate === value)
  return genre ?? invalidResponse('query.genre')
}

export const normalizeMapQuery = (value: unknown): MapNewQuery => {
  const query = readMapObject(value, 'query')
  return {
    ...readMapBounds(query, 'query'),
    sort: readSort(query.sort),
    ...(query.mapRegionId == null
      ? {}
      : { mapRegionId: readMapId(query.mapRegionId, 'query.mapRegionId') }),
    ...(query.keyword == null
      ? {}
      : { keyword: readString(query.keyword, 'query.keyword').trim() }),
    ...(query.genre == null ? {} : { genre: readGenre(query.genre) }),
    ...(query.placeType == null
      ? {}
      : { placeType: readPlaceType(query.placeType) }),
  }
}

export const normalizeMapLocation = (value: unknown): MapRestaurantLocation => {
  const location = readMapObject(value, 'location')
  return {
    position: readPosition(location, 'location'),
    validUntil: readTimestamp(location.validUntil, 'location.validUntil'),
    attributions: readArray(
      location.attributions ?? [],
      'location.attributions',
    ).map((value) => {
      const attribution = readMapObject(value, 'attribution')
      const uri = readString(attribution.uri, 'attribution.uri')
      if (!/^https?:\/\//i.test(uri)) return invalidResponse('attribution.uri')
      return {
        displayName: readString(
          attribution.displayName,
          'attribution.displayName',
        ),
        uri,
      }
    }),
  }
}

const getImageUrl = (value: unknown): string | undefined => {
  const association = readMapObject(value, 'image association')
  if (association.image != null) {
    const image = readMapObject(association.image, 'image')
    if (image.status !== 'READY' || !image.defaultSource) return undefined
    return (
      readOptionalText(
        readMapObject(image.defaultSource, 'defaultSource').url,
      ) || undefined
    )
  }
  return readOptionalText(association.legacyUrl) || undefined
}

const getImages = (card: Record<string, unknown>): string[] => {
  if (card.cardImages != null) {
    return readArray(card.cardImages, 'cardImages')
      .map((value) => readMapObject(value, 'cardImage'))
      .sort(
        (left, right) =>
          (typeof left.displayOrder === 'number' ? left.displayOrder : 0) -
          (typeof right.displayOrder === 'number' ? right.displayOrder : 0),
      )
      .flatMap((image) => getImageUrl(image) ?? [])
  }
  if (card.thumbnailImage != null) {
    const image = getImageUrl(card.thumbnailImage)
    return image ? [image] : []
  }
  const images =
    card.imageUrls == null
      ? []
      : readArray(card.imageUrls, 'imageUrls').filter(
          (value): value is string =>
            typeof value === 'string' && value.length > 0,
        )
  return images.length
    ? images
    : card.thumbnailUrl
      ? [readString(card.thumbnailUrl, 'thumbnailUrl')]
      : []
}

const CUISINE_LABELS: Record<string, string> = {
  sushi: '스시/사시미류',
  noodle: '면류',
  'rice-bowl': '덮밥류',
  nabe: '나베/냄비류',
  fried: '튀김류',
  grill: '철판/구이류',
  etc: '기타',
}

const getHours = (value: unknown): string => {
  if (value == null) return ''
  const hours = readMapObject(value, 'todayBusinessHour')
  if (hours.closed === true) return '휴무'
  return typeof hours.openTime === 'string' &&
    typeof hours.closeTime === 'string'
    ? `${hours.openTime} - ${hours.closeTime}`
    : ''
}

const getPrice = (value: unknown): string => {
  if (value == null) return ''
  const price = readMapObject(value, 'priceRange')
  if (typeof price.currency !== 'string' || typeof price.minPrice !== 'number')
    return ''
  const min = price.minPrice.toLocaleString('ko-KR')
  const max =
    typeof price.maxPrice === 'number'
      ? ` - ${price.maxPrice.toLocaleString('ko-KR')}`
      : ''
  return `${price.currency} ${min}${max}`
}

const normalizeRestaurant = (
  value: unknown,
  query: MapNewQuery,
  index: number,
): MapRestaurant => {
  const card = readMapObject(value, 'content item')
  const cuisine = readOptionalText(card.foodCategory ?? card.genre)
  const rating = readNumber(card.rating, 'rating')
  if (rating < 0 || rating > 5) return invalidResponse('rating')
  return {
    id: String(readMapId(card.restaurantId, 'restaurantId')),
    name: readString(card.name, 'name'),
    areaCode: query.mapRegionId === undefined ? '' : String(query.mapRegionId),
    category: readPlaceType(card.placeType),
    cuisine: CUISINE_LABELS[cuisine] ?? cuisine,
    rating,
    reviewCount: readCount(card.reviewCount, 'reviewCount'),
    recommendationRank: index + 1,
    menuKeywords: readArray(card.hashtags ?? [], 'hashtags').filter(
      (value): value is string => typeof value === 'string',
    ),
    images: getImages(card),
    hours: getHours(card.todayBusinessHour),
    price: getPrice(card.priceRange),
    description: readOptionalText(card.summary),
    address: '',
    ...normalizeMapLocation(card.location),
  }
}

export const normalizeMapRestaurantPage = (
  value: MapPageResponse | null,
): MapRestaurantPage => {
  const data = readMapObject(value, 'page')
  const query = normalizeMapQuery(data.query)
  if (typeof data.hasNext !== 'boolean') return invalidResponse('hasNext')
  const searchResult =
    data.searchResult == null
      ? undefined
      : readMapObject(data.searchResult, 'searchResult')
  const totalCount = searchResult
    ? readCount(searchResult.totalCount, 'searchResult.totalCount')
    : undefined
  if (query.keyword && !searchResult) return invalidResponse('searchResult')
  return {
    restaurants: readArray(data.content, 'content').map((card, index) =>
      normalizeRestaurant(card, query, index),
    ),
    hasNext: data.hasNext,
    ...(data.hasNext
      ? { nextCursor: readString(data.nextCursor, 'nextCursor') }
      : {}),
    querySessionId: readString(data.querySessionId, 'querySessionId'),
    expiresAt: readTimestamp(data.expiresAt, 'expiresAt'),
    rankingAsOf: readTimestamp(data.rankingAsOf, 'rankingAsOf'),
    query,
    ...(searchResult && totalCount !== undefined
      ? {
          searchResult: {
            totalCount,
            bounds:
              totalCount === 0
                ? null
                : readMapBounds(
                    searchResult.bounds,
                    'searchResult.bounds',
                    true,
                  ),
          },
        }
      : {}),
  }
}

export const normalizeMapRegions = (
  value: MapRegionsResponse | null,
): MapRegions => {
  const data = readMapObject(value, 'regions response')
  const limits = readMapObject(data.queryLimits, 'queryLimits')
  const maxLatitudeSpan = readNumber(limits.maxLatitudeSpan, 'maxLatitudeSpan')
  const maxLongitudeSpan = readNumber(
    limits.maxLongitudeSpan,
    'maxLongitudeSpan',
  )
  if (maxLatitudeSpan <= 0 || maxLongitudeSpan <= 0)
    return invalidResponse('queryLimits')
  return {
    initialBounds: readMapBounds(data.initialBounds, 'initialBounds'),
    queryLimits: {
      supportedBounds: readMapBounds(limits.supportedBounds, 'supportedBounds'),
      maxLatitudeSpan,
      maxLongitudeSpan,
    },
    regions: readArray(data.regions, 'regions').map((value) => {
      const region = readMapObject(value, 'region')
      return {
        code: String(readMapId(region.mapRegionId, 'mapRegionId')),
        name: readString(region.name, 'region.name'),
        restaurantCount: readCount(region.restaurantCount, 'restaurantCount'),
        position: readPosition(region.clusterPosition, 'clusterPosition'),
        cameraBounds: readMapBounds(region.cameraBounds, 'cameraBounds'),
      }
    }),
  }
}
