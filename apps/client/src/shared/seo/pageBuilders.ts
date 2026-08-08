import type {
  SeoMagazine,
  SeoMenu,
  SeoPage,
  SeoRestaurant,
  SeoRobots,
  SeoSnapshot,
} from '@/shared/seo/types'

export const SEO_SITE_ORIGIN = 'https://www.hashi.kr'
export const SEO_DEFAULT_IMAGE = `${SEO_SITE_ORIGIN}/icons/pwa-512x512.png`

const RESTAURANT_IMAGE_SIZE = 143
const MAGAZINE_IMAGE_WIDTH = 156
const MAGAZINE_IMAGE_HEIGHT = 88
const DETAIL_IMAGE_WIDTH = 393
const DETAIL_IMAGE_HEIGHT = 234

const formatPrice = (price: number, currency: string) =>
  `${currency} ${price.toLocaleString('ko-KR')}`

const createPath = (template: string, params: Record<string, string>) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    template,
  )

export const createCanonicalUrl = (path: string) => {
  const url = new URL(path, SEO_SITE_ORIGIN)
  const normalizedPath =
    url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '')

  return `${SEO_SITE_ORIGIN}${normalizedPath}`
}

interface CreateSeoPageParams {
  canonicalPath: string
  description: string
  image?: string
  robots?: SeoRobots
  snapshot: SeoSnapshot
  structuredData?: Record<string, unknown>[]
  title: string
}

const createSeoPage = ({
  canonicalPath,
  description,
  image,
  robots = 'index, follow',
  snapshot,
  structuredData = [],
  title,
}: CreateSeoPageParams): SeoPage => ({
  canonical: createCanonicalUrl(canonicalPath),
  description,
  image: image || SEO_DEFAULT_IMAGE,
  robots,
  snapshot,
  structuredData,
  title,
  type: 'website',
})

const getRestaurantPath = (restaurantId: string) =>
  createPath('/restaurants/:restaurantId', { restaurantId })

const getMenuPath = (restaurantId: string, menuId: string) =>
  createPath('/restaurants/:restaurantId/menus/:menuId', {
    menuId,
    restaurantId,
  })

const createRestaurantItemList = (restaurants: SeoRestaurant[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: restaurants.map((restaurant, index) => ({
    '@type': 'ListItem',
    item: {
      '@type': 'Restaurant',
      name: restaurant.name,
      url: createCanonicalUrl(getRestaurantPath(restaurant.id)),
    },
    position: index + 1,
  })),
  numberOfItems: restaurants.length,
})

export const createHomeSeoPage = ({
  magazines = [],
  restaurants,
}: {
  magazines?: SeoMagazine[]
  restaurants: SeoRestaurant[]
}) =>
  createSeoPage({
    canonicalPath: '/',
    description:
      '한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스 HASHI입니다.',
    image: magazines[0]?.image || restaurants[0]?.images[0],
    snapshot: {
      heading: 'HASHI',
      links: [
        ...magazines.flatMap((magazine) =>
          magazine.externalUrl
            ? [
                {
                  href: magazine.externalUrl,
                  image: magazine.image,
                  imageAlt: `${magazine.title} 배너`,
                  imageHeight: 160,
                  imageWidth: 353,
                  label: magazine.title,
                },
              ]
            : [],
        ),
        ...restaurants.map((restaurant) => ({
          href: getRestaurantPath(restaurant.id),
          image: restaurant.images[0],
          imageAlt: `${restaurant.name} 대표 이미지`,
          imageHeight: RESTAURANT_IMAGE_SIZE,
          imageWidth: RESTAURANT_IMAGE_SIZE,
          label: restaurant.name,
        })),
      ],
      summary: '한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스입니다.',
    },
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        logo: SEO_DEFAULT_IMAGE,
        name: 'HASHI',
        url: `${SEO_SITE_ORIGIN}/`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        inLanguage: 'ko-KR',
        name: 'HASHI',
        url: `${SEO_SITE_ORIGIN}/`,
      },
    ],
    title: 'HASHI | 일본 맛집 발견부터 예약까지',
  })

interface CreateRestaurantListSeoPageParams {
  restaurants: SeoRestaurant[]
  type: 'hashi-pick' | 'popular'
}

const RESTAURANT_LIST_SEO_BY_TYPE = {
  'hashi-pick': {
    description:
      'HASHI가 직접 고른 일본 현지 맛집을 지역과 장르별로 만나보세요.',
    heading: '하시 PICK',
    path: '/restaurants/hashi-pick',
    title: '하시 PICK | 일본 현지 맛집 큐레이션 | HASHI',
  },
  popular: {
    description: '여행자에게 인기 있는 일본 맛집의 정보와 메뉴를 확인하세요.',
    heading: '인기 맛집',
    path: '/restaurants/popular',
    title: '인기 맛집 | 일본 인기 식당 추천 | HASHI',
  },
} as const

export const createRestaurantListSeoPage = ({
  restaurants,
  type,
}: CreateRestaurantListSeoPageParams) => {
  const config = RESTAURANT_LIST_SEO_BY_TYPE[type]

  return createSeoPage({
    canonicalPath: config.path,
    description: config.description,
    image: restaurants[0]?.images[0],
    snapshot: {
      heading: config.heading,
      links: restaurants.map((restaurant) => ({
        href: getRestaurantPath(restaurant.id),
        image: restaurant.images[0],
        imageAlt: `${restaurant.name} 대표 이미지`,
        imageHeight: RESTAURANT_IMAGE_SIZE,
        imageWidth: RESTAURANT_IMAGE_SIZE,
        label: restaurant.name,
      })),
      summary: config.description,
    },
    structuredData: [createRestaurantItemList(restaurants)],
    title: config.title,
  })
}

export const createRestaurantDetailSeoPage = (restaurant: SeoRestaurant) => {
  const canonicalPath = getRestaurantPath(restaurant.id)
  const description =
    restaurant.description ||
    `${restaurant.name}의 위치, 메뉴, 가격, 영업시간과 예약 정보를 확인하세요.`
  const restaurantSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    description,
    name: restaurant.name,
    url: createCanonicalUrl(canonicalPath),
  }

  if (restaurant.address) {
    restaurantSchema.address = restaurant.address
  }

  if (restaurant.images.length > 0) {
    restaurantSchema.image = restaurant.images
  }

  if (restaurant.cuisine) {
    restaurantSchema.servesCuisine = restaurant.cuisine
  }

  if (restaurant.priceRange) {
    restaurantSchema.priceRange = restaurant.priceRange
  }

  if (restaurant.rating > 0 && restaurant.reviewCount > 0) {
    restaurantSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: restaurant.rating,
      reviewCount: restaurant.reviewCount,
    }
  }

  return createSeoPage({
    canonicalPath,
    description,
    image: restaurant.images[0],
    snapshot: {
      facts: [
        ...(restaurant.address
          ? [{ label: '주소', value: restaurant.address }]
          : []),
        ...(restaurant.rating > 0 && restaurant.reviewCount > 0
          ? [
              {
                label: '평점',
                value: `${restaurant.rating}/5 · 리뷰 ${restaurant.reviewCount}개`,
              },
            ]
          : []),
        ...(restaurant.priceRange
          ? [{ label: '가격대', value: restaurant.priceRange }]
          : []),
        ...(restaurant.businessHours ?? []),
      ],
      heading: restaurant.name,
      image: restaurant.images[0],
      imageAlt: `${restaurant.name} 대표 이미지`,
      imageHeight: DETAIL_IMAGE_HEIGHT,
      imageWidth: DETAIL_IMAGE_WIDTH,
      links: restaurant.menus.map((menu) => ({
        href: getMenuPath(restaurant.id, menu.id),
        image: menu.image,
        imageAlt: `${menu.name} 메뉴 이미지`,
        imageHeight: RESTAURANT_IMAGE_SIZE,
        imageWidth: RESTAURANT_IMAGE_SIZE,
        label: menu.name,
      })),
      summary: description,
    },
    structuredData: [restaurantSchema],
    title: `${restaurant.name} | 일본 맛집 정보·메뉴·예약 | HASHI`,
  })
}

interface CreateMenuDetailSeoPageParams {
  menu: SeoMenu
  otherMenus: SeoMenu[]
  restaurant: Pick<SeoRestaurant, 'id' | 'name'>
}

export const createMenuDetailSeoPage = ({
  menu,
  otherMenus,
  restaurant,
}: CreateMenuDetailSeoPageParams) => {
  const canonicalPath = getMenuPath(restaurant.id, menu.id)
  const restaurantPath = getRestaurantPath(restaurant.id)
  const description =
    menu.description ||
    `${restaurant.name}의 ${menu.name} 메뉴 정보와 가격을 확인하세요.`
  const offer =
    menu.price !== undefined &&
    Number.isFinite(menu.price) &&
    menu.price >= 0 &&
    menu.currency
      ? {
          '@type': 'Offer',
          price: menu.price,
          priceCurrency: menu.currency,
        }
      : undefined

  return createSeoPage({
    canonicalPath,
    description,
    image: menu.image,
    snapshot: {
      facts: offer
        ? [
            {
              label: '가격',
              value: formatPrice(offer.price, offer.priceCurrency),
            },
          ]
        : [],
      heading: menu.name,
      image: menu.image,
      imageAlt: `${menu.name} 메뉴 이미지`,
      imageHeight: DETAIL_IMAGE_HEIGHT,
      imageWidth: DETAIL_IMAGE_WIDTH,
      links: [
        { href: restaurantPath, label: restaurant.name },
        ...otherMenus.map((otherMenu) => ({
          href: getMenuPath(restaurant.id, otherMenu.id),
          image: otherMenu.image,
          imageAlt: `${otherMenu.name} 메뉴 이미지`,
          imageHeight: RESTAURANT_IMAGE_SIZE,
          imageWidth: RESTAURANT_IMAGE_SIZE,
          label: otherMenu.name,
        })),
      ],
      summary: description,
    },
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'MenuItem',
        description,
        image: menu.image,
        name: menu.name,
        ...(offer ? { offers: offer } : {}),
        url: createCanonicalUrl(canonicalPath),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            item: `${SEO_SITE_ORIGIN}/`,
            name: '홈',
            position: 1,
          },
          {
            '@type': 'ListItem',
            item: createCanonicalUrl(restaurantPath),
            name: restaurant.name,
            position: 2,
          },
          {
            '@type': 'ListItem',
            item: createCanonicalUrl(canonicalPath),
            name: menu.name,
            position: 3,
          },
        ],
      },
    ],
    title: `${menu.name} - ${restaurant.name} | HASHI`,
  })
}

export const createMagazineListSeoPage = ({
  magazines,
}: {
  magazines: SeoMagazine[]
}) => {
  const canonicalPath = '/magazines'
  const description = 'HASHI가 소개하는 일본 미식과 여행 콘텐츠를 만나보세요.'
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: magazines.map((magazine, index) => ({
      '@type': 'ListItem',
      item: magazine.externalUrl || createCanonicalUrl(canonicalPath),
      name: magazine.title,
      position: index + 1,
    })),
    numberOfItems: magazines.length,
  }

  return createSeoPage({
    canonicalPath,
    description,
    image: magazines[0]?.image,
    snapshot: {
      heading: 'HASHI 매거진',
      links: magazines.flatMap((magazine) =>
        magazine.externalUrl
          ? [
              {
                href: magazine.externalUrl,
                image: magazine.image,
                imageAlt: `${magazine.title} 대표 이미지`,
                imageHeight: MAGAZINE_IMAGE_HEIGHT,
                imageWidth: MAGAZINE_IMAGE_WIDTH,
                label: magazine.title,
              },
            ]
          : [],
      ),
      summary: description,
    },
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        description,
        name: 'HASHI 매거진',
        url: createCanonicalUrl(canonicalPath),
      },
      itemList,
    ],
    title: 'HASHI 매거진 | 일본 미식·여행 콘텐츠',
  })
}

export const createNoindexSeoPage = ({
  description,
  pathname,
  robots,
  title,
}: {
  description: string
  pathname: string
  robots: Exclude<SeoRobots, 'index, follow'>
  title: string
}) =>
  createSeoPage({
    canonicalPath: pathname,
    description,
    robots,
    snapshot: {
      heading: title,
      links: [],
      summary: description,
    },
    title,
  })

export const createNotFoundSeoPage = (pathname: string) =>
  createNoindexSeoPage({
    description: '요청한 페이지를 찾을 수 없습니다.',
    pathname,
    robots: 'noindex, nofollow',
    title: '페이지를 찾을 수 없습니다 | HASHI',
  })
