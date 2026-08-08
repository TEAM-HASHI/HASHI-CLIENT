import { normalizeInstagramUrl } from '../src/shared/utils/normalizeInstagramUrl'
import type {
  SeoFact,
  SeoMagazine,
  SeoMenu,
  SeoRestaurant,
} from '../src/shared/seo/types'
import type {
  MagazineListResponse,
  RestaurantListItem,
  RestaurantListParams,
  RestaurantMenuListResponse,
  RestaurantStoreInformationResponse,
  SeoApi,
  SeoInventory,
} from './types'

const PAGE_SIZE = 10
const RESTAURANT_CONCURRENCY = 4
const DAY_LABELS: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
}

const requirePositiveId = (value: unknown, label: string) => {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) {
    throw new Error(`${label}는 양의 정수여야 합니다.`)
  }

  return Number(value)
}

const requireName = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} 이름이 비어 있습니다.`)
  }

  return value.trim()
}

const optionalString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : ''

const optionalImageArray = (value: unknown) =>
  Array.isArray(value)
    ? value.flatMap((image) =>
        typeof image === 'string' && image.trim() ? [image.trim()] : [],
      )
    : []

const formatBusinessHours = (
  businessHours: RestaurantStoreInformationResponse['businessHours'],
): SeoFact[] =>
  (businessHours ?? []).flatMap((hours) => {
    const label = DAY_LABELS[optionalString(hours.dayOfWeek).toUpperCase()]

    if (!label) {
      return []
    }

    if (hours.closed) {
      return [{ label, value: '휴무' }]
    }

    if (!hours.openTime || !hours.closeTime) {
      return []
    }

    const breakHours =
      hours.breakStart && hours.breakEnd
        ? ` · 브레이크 ${hours.breakStart} - ${hours.breakEnd}`
        : ''

    return [
      {
        label,
        value: `${hours.openTime} - ${hours.closeTime}${breakHours}`,
      },
    ]
  })

const formatPriceRange = (
  priceRange: RestaurantStoreInformationResponse['priceRange'],
) => {
  if (!priceRange?.currency || priceRange.minPrice === undefined) {
    return undefined
  }

  const minPrice = priceRange.minPrice.toLocaleString('ko-KR')
  const maxPrice = priceRange.maxPrice?.toLocaleString('ko-KR')
  return maxPrice
    ? `${priceRange.currency} ${minPrice} - ${maxPrice}`
    : `${priceRange.currency} ${minPrice}`
}

const mapListRestaurant = (item: RestaurantListItem): SeoRestaurant => {
  const id = requirePositiveId(item.restaurantId, '식당 ID')

  return {
    address: optionalString(item.area),
    cuisine: optionalString(item.foodCategory || item.genre),
    description: optionalString(item.summary),
    id: String(id),
    images: [
      ...optionalImageArray(item.imageUrls),
      ...(item.thumbnailUrl ? [item.thumbnailUrl] : []),
    ].filter((image, index, images) => images.indexOf(image) === index),
    menus: [],
    name: requireName(item.name, `식당 ${id}`),
    rating: typeof item.rating === 'number' ? item.rating : 0,
    reviewCount: 0,
  }
}

const addUnique = <T>(
  target: Map<string, T>,
  id: string,
  value: T,
  label: string,
) => {
  const current = target.get(id)

  if (current && JSON.stringify(current) !== JSON.stringify(value)) {
    throw new Error(`${label} ${id}의 중복 데이터가 서로 다릅니다.`)
  }

  target.set(id, current ?? value)
}

const assertNextCursor = <T extends string | number>(
  cursor: T | undefined,
  seen: Set<T>,
  label: string,
) => {
  if (cursor === undefined || cursor === null || cursor === '') {
    throw new Error(`${label} hasNext가 true이지만 nextCursor가 없습니다.`)
  }

  if (seen.has(cursor)) {
    throw new Error(`${label} cursor가 반복되었습니다: ${cursor}`)
  }

  seen.add(cursor)
  return cursor
}

const collectAllRestaurants = async (api: SeoApi) => {
  const restaurants = new Map<string, SeoRestaurant>()
  const seenCursors = new Set<string>()
  let cursor: string | undefined

  while (true) {
    const response = await api.getRestaurants({
      cursor,
      genre: 'all',
      size: PAGE_SIZE,
      sort: 'basic',
    })

    for (const item of response.content ?? []) {
      const restaurant = mapListRestaurant(item)
      addUnique(restaurants, restaurant.id, restaurant, '식당')
    }

    if (!response.hasNext) {
      break
    }

    cursor = assertNextCursor(response.nextCursor, seenCursors, '식당 목록')
  }

  if (restaurants.size === 0) {
    throw new Error('SEO 빌드에 사용할 공개 식당이 한 건도 없습니다.')
  }

  return [...restaurants.values()]
}

const collectRestaurantSnapshot = async (
  api: SeoApi,
  params: RestaurantListParams,
) => {
  const response = await api.getRestaurants({
    ...params,
    size: params.size ?? PAGE_SIZE,
  })
  const restaurants = new Map<string, SeoRestaurant>()

  for (const item of response.content ?? []) {
    const restaurant = mapListRestaurant(item)
    addUnique(restaurants, restaurant.id, restaurant, '식당 snapshot')
  }

  return [...restaurants.values()]
}

const mapMenu = (
  menu: NonNullable<RestaurantMenuListResponse['content']>[number],
): SeoMenu => {
  const id = requirePositiveId(menu.menuId, '메뉴 ID')

  return {
    currency: optionalString(menu.currency) || undefined,
    description: optionalString(menu.description),
    id: String(id),
    image: optionalString(menu.imageUrl) || undefined,
    name: requireName(menu.name, `메뉴 ${id}`),
    price:
      typeof menu.price === 'number' && Number.isFinite(menu.price)
        ? menu.price
        : undefined,
  }
}

const collectRestaurantMenus = async (api: SeoApi, restaurantId: number) => {
  const menus = new Map<string, SeoMenu>()
  const seenCursors = new Set<number>()
  let cursor: number | undefined

  while (true) {
    const response = await api.getRestaurantMenus(restaurantId, {
      cursor,
      size: PAGE_SIZE,
    })

    for (const item of response.content ?? []) {
      const menu = mapMenu(item)
      addUnique(menus, menu.id, menu, `식당 ${restaurantId} 메뉴`)
    }

    if (!response.hasNext) {
      break
    }

    cursor = assertNextCursor(
      response.nextCursor,
      seenCursors,
      `식당 ${restaurantId} 메뉴 목록`,
    )
  }

  return [...menus.values()]
}

const collectRestaurantDetail = async (
  api: SeoApi,
  restaurantListItem: SeoRestaurant,
): Promise<SeoRestaurant> => {
  const restaurantId = Number(restaurantListItem.id)
  const [summary, storeInformation, menus] = await Promise.all([
    api.getRestaurantSummary(restaurantId),
    api.getRestaurantStoreInformation(restaurantId),
    collectRestaurantMenus(api, restaurantId),
  ])
  const responseRestaurantId = requirePositiveId(
    summary.restaurantId,
    '식당 상세 ID',
  )

  if (responseRestaurantId !== restaurantId) {
    throw new Error(
      `식당 ${restaurantId} 상세 응답 ID가 ${responseRestaurantId}로 다릅니다.`,
    )
  }

  if (
    storeInformation.restaurantId !== undefined &&
    storeInformation.restaurantId !== restaurantId
  ) {
    throw new Error(`식당 ${restaurantId} 매장 정보 ID가 다릅니다.`)
  }

  const images = [
    ...optionalImageArray(summary.imageUrls),
    ...(summary.thumbnailUrl ? [summary.thumbnailUrl] : []),
  ].filter((image, index, values) => values.indexOf(image) === index)

  return {
    address: optionalString(summary.address),
    businessHours: formatBusinessHours(storeInformation.businessHours),
    cuisine: optionalString(summary.foodCategory),
    description:
      optionalString(storeInformation.description) ||
      optionalString(summary.summary),
    id: String(restaurantId),
    images,
    menus,
    name: requireName(summary.name, `식당 ${restaurantId}`),
    priceRange: formatPriceRange(storeInformation.priceRange),
    rating: typeof summary.rating === 'number' ? summary.rating : 0,
    reviewCount:
      typeof summary.reviewCount === 'number' ? summary.reviewCount : 0,
  }
}

const mapWithConcurrency = async <T, R>(
  values: T[],
  limit: number,
  mapper: (value: T) => Promise<R>,
) => {
  const results = new Array<R>(values.length)
  let nextIndex = 0

  const workers = Array.from(
    { length: Math.min(limit, values.length) },
    async () => {
      while (nextIndex < values.length) {
        const currentIndex = nextIndex
        nextIndex += 1
        results[currentIndex] = await mapper(values[currentIndex])
      }
    },
  )

  await Promise.all(workers)
  return results
}

const mapMagazine = (
  magazine: NonNullable<MagazineListResponse['magazines']>[number],
): SeoMagazine => {
  const id = requirePositiveId(magazine.magazineId, '매거진 ID')

  return {
    externalUrl: normalizeInstagramUrl(magazine.instagramRedirectUrl ?? ''),
    id: String(id),
    image: magazine.thumbnailImageUrl || magazine.bannerImageUrl,
    publishedDate: magazine.createdAt,
    title: requireName(magazine.title, `매거진 ${id}`),
  }
}

const collectMagazines = async (api: SeoApi) => {
  const magazines = new Map<string, SeoMagazine>()
  const seenCursors = new Set<number>()
  let cursor: number | undefined

  while (true) {
    const response = await api.getMagazines({ cursor, size: PAGE_SIZE })

    for (const item of response.magazines ?? []) {
      const magazine = mapMagazine(item)
      addUnique(magazines, magazine.id, magazine, '매거진')
    }

    if (!response.hasNext) {
      break
    }

    cursor = assertNextCursor(response.nextCursor, seenCursors, '매거진 목록')
  }

  return [...magazines.values()]
}

const collectBanners = async (api: SeoApi) => {
  const response = await api.getMagazineBanners()

  return (response.banners ?? []).map((banner) => {
    const id = requirePositiveId(banner.magazineId, '매거진 배너 ID')

    return {
      externalUrl: normalizeInstagramUrl(banner.instagramRedirectUrl ?? ''),
      id: String(id),
      image: banner.bannerImageUrl,
      title: requireName(banner.title, `매거진 배너 ${id}`),
    } satisfies SeoMagazine
  })
}

export const collectSeoInventory = async (
  api: SeoApi,
): Promise<SeoInventory> => {
  const [
    restaurantItems,
    hashiPick,
    popular,
    homeRestaurants,
    magazines,
    banners,
  ] = await Promise.all([
    collectAllRestaurants(api),
    collectRestaurantSnapshot(api, {
      genre: 'all',
      sort: 'basic',
      type: 'hashi-pick',
    }),
    collectRestaurantSnapshot(api, {
      genre: 'all',
      sort: 'basic',
      type: 'popular',
    }),
    collectRestaurantSnapshot(api, { size: 5, type: 'sns-hot' }),
    collectMagazines(api),
    collectBanners(api),
  ])

  const restaurants = await mapWithConcurrency(
    restaurantItems,
    RESTAURANT_CONCURRENCY,
    async (restaurant) => ({
      restaurant: await collectRestaurantDetail(api, restaurant),
    }),
  )

  return {
    banners,
    hashiPick,
    homeRestaurants,
    magazines,
    popular,
    restaurants,
  }
}
