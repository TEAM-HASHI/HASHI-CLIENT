import type {
  AdminReservationSummary,
  CreateMagazineResponseData,
  CreateRestaurantResponseData,
  DashboardMetrics,
  Magazine,
  MagazineFormData,
  MockScenario,
  AdminReservationStatus,
  ReservationUserResponseData,
  Restaurant,
  RestaurantFormData,
  UpdateMagazineResponseData,
  UpdateReservationStatusResponseData,
} from '@/shared/api/adminTypes'

const MOCK_DELAY_MS = 260

const restaurants: Restaurant[] = [
  {
    id: 'RST-1042',
    name: '해시 다이닝 성수',
    localName: 'HASHI Dining Seongsu',
    description: '성수에서 즐기는 모던 다이닝 코스입니다.',
    address: '서울 성동구 연무장길 18',
    area: '서울',
    genre: 'etc',
    thumbnailFileKey: 'uploads/restaurants/mock/hashi-dining-thumbnail.jpg',
    imageFileKeys: ['uploads/restaurants/mock/hashi-dining-hall.jpg'],
    reservationFee: 4000,
    priceRange: {
      currency: 'KRW',
      minPrice: 80000,
      maxPrice: 140000,
    },
    businessHours: [
      {
        dayOfWeek: 'MONDAY',
        openTime: '17:00',
        closeTime: '22:00',
        lastOrderTime: '20:30',
        closed: false,
      },
    ],
    menus: [
      {
        name: '시그니처 코스',
        description: '제철 식재료를 활용한 디너 코스입니다.',
        currency: 'KRW',
        price: 120000,
        representative: true,
      },
    ],
    curationTypes: ['hashi-pick', 'today-restaurant'],
    active: true,
    status: 'open',
    isReservationAvailable: true,
    updatedAt: '2026-07-08 18:10',
  },
  {
    id: 'RST-1038',
    name: '모락 한식당',
    localName: 'Morak',
    description: '예약으로 운영되는 차분한 한식 다이닝입니다.',
    address: '서울 종로구 돈화문로 42',
    area: '서울',
    genre: 'rice-bowl',
    thumbnailFileKey: 'uploads/restaurants/mock/morak-thumbnail.jpg',
    imageFileKeys: ['uploads/restaurants/mock/morak-table.jpg'],
    reservationFee: 3000,
    priceRange: {
      currency: 'KRW',
      minPrice: 30000,
      maxPrice: 70000,
    },
    businessHours: [
      {
        dayOfWeek: 'TUESDAY',
        openTime: '11:30',
        closeTime: '21:00',
        lastOrderTime: '20:00',
        closed: false,
      },
    ],
    menus: [
      {
        name: '제철 한상',
        description: '계절 반찬과 메인 요리를 함께 제공하는 한상차림입니다.',
        currency: 'KRW',
        price: 42000,
        representative: true,
      },
    ],
    curationTypes: ['popular'],
    active: true,
    status: 'open',
    isReservationAvailable: true,
    updatedAt: '2026-07-08 13:40',
  },
  {
    id: 'RST-1024',
    name: '루프탑 키친',
    localName: 'Rooftop Kitchen',
    description: '루프탑 좌석과 그릴 메뉴를 운영하는 식당입니다.',
    address: '서울 마포구 양화로 112',
    area: '서울',
    genre: 'grill',
    thumbnailFileKey: 'uploads/restaurants/mock/rooftop-thumbnail.jpg',
    imageFileKeys: ['uploads/restaurants/mock/rooftop-night.jpg'],
    reservationFee: 5000,
    priceRange: {
      currency: 'KRW',
      minPrice: 50000,
      maxPrice: 90000,
    },
    businessHours: [
      {
        dayOfWeek: 'FRIDAY',
        openTime: '18:00',
        closeTime: '23:00',
        lastOrderTime: '21:30',
        closed: false,
      },
    ],
    menus: [
      {
        name: '그릴 플래터',
        description: '육류와 채소를 함께 구성한 대표 메뉴입니다.',
        currency: 'KRW',
        price: 68000,
        representative: true,
      },
    ],
    curationTypes: ['sns-hot'],
    active: false,
    status: 'paused',
    isReservationAvailable: false,
    updatedAt: '2026-07-07 20:15',
  },
  {
    id: 'RST-1009',
    name: '초록 테이블',
    localName: 'Green Table',
    description: '식물성 재료를 중심으로 한 비건 식당입니다.',
    address: '서울 강남구 도산대로 31길 9',
    area: '서울',
    genre: 'etc',
    thumbnailFileKey: 'uploads/restaurants/mock/green-table-thumbnail.jpg',
    imageFileKeys: ['uploads/restaurants/mock/green-table-menu.jpg'],
    reservationFee: 2000,
    priceRange: {
      currency: 'KRW',
      minPrice: 20000,
      maxPrice: 45000,
    },
    businessHours: [
      {
        dayOfWeek: 'SUNDAY',
        openTime: null,
        closeTime: null,
        lastOrderTime: null,
        closed: true,
      },
    ],
    menus: [
      {
        name: '비건 플레이트',
        description: '제철 채소와 곡물을 구성한 플레이트입니다.',
        currency: 'KRW',
        price: 28000,
        representative: true,
      },
    ],
    curationTypes: [],
    active: false,
    status: 'closed',
    isReservationAvailable: false,
    updatedAt: '2026-07-05 09:30',
  },
]

const reservations: AdminReservationSummary[] = [
  {
    id: 7851,
    appliedAt: '2026-07-02T10:05:00',
    reservedAt: '2026-07-09T19:30:00',
    reservationStatus: 'CONTACTING',
    paymentStatus: 'PAID',
    restaurant: { id: 1042, name: '해시 다이닝 성수' },
    user: { id: 91, nickname: '김민수', phone: '010-8841-1004' },
    adultCount: 2,
    teenCount: 0,
    childCount: 0,
    amount: 4000,
  },
  {
    id: 7848,
    appliedAt: '2026-07-01T16:24:00',
    reservedAt: '2026-07-09T12:30:00',
    reservationStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    restaurant: { id: 1038, name: '모락 한식당' },
    user: { id: 88, nickname: '신동호', phone: '010-5591-2841' },
    adultCount: 4,
    teenCount: 0,
    childCount: 0,
    amount: 4000,
  },
  {
    id: 7814,
    appliedAt: '2026-06-28T09:12:00',
    reservedAt: '2026-07-08T20:00:00',
    reservationStatus: 'VISITED',
    paymentStatus: 'PAID',
    restaurant: { id: 1024, name: '루프탑 키친' },
    user: { id: 75, nickname: '조태완', phone: '010-2012-8201' },
    adultCount: 2,
    teenCount: 1,
    childCount: 0,
    amount: 4000,
  },
  {
    id: 7802,
    appliedAt: '2026-06-24T18:40:00',
    reservedAt: '2026-07-06T13:00:00',
    reservationStatus: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    restaurant: { id: 1009, name: '초록 테이블' },
    user: { id: 62, nickname: '이지명', phone: '010-9321-4012' },
    adultCount: 1,
    teenCount: 0,
    childCount: 0,
    amount: null,
  },
]

const reservationUsers: Record<number, ReservationUserResponseData['user']> = {
  91: {
    id: 91,
    nickname: '김민수',
    nameEng: 'Minsu Kim',
    birthDate: '1994-08-12',
    phone: '010-8841-1004',
    email: 'ckddus1541@daum.net',
    profileImageUrl: null,
  },
  88: {
    id: 88,
    nickname: '신동호',
    nameEng: 'Dongho Shin',
    birthDate: '1991-03-04',
    phone: '010-5591-2841',
    email: 'ssiin1244@gmail.com',
    profileImageUrl: null,
  },
  75: {
    id: 75,
    nickname: '조태완',
    nameEng: 'Taewan Cho',
    birthDate: '1999-11-21',
    phone: '010-2012-8201',
    email: 'taewan2002@naver.com',
    profileImageUrl: null,
  },
  62: {
    id: 62,
    nickname: '이지명',
    nameEng: null,
    birthDate: '1988-05-18',
    phone: '010-9321-4012',
    email: 'gynjy0216@gmail.com',
    profileImageUrl: null,
  },
}

const magazines: Magazine[] = [
  {
    id: 204,
    title: '성수에서 예약률이 높은 저녁 코스',
    content: '성수에서 저녁 예약률이 높은 코스 식당을 큐레이션합니다.',
    region: 'TOKYO',
    series: 'WEEKLY',
    genre: 'IZAKAYA',
    bannerImageKey: 'magazines/mock/seongsu-course-banner.jpg',
    bannerUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=480&q=80',
    cards: [
      { imageKey: 'magazines/mock/seongsu-course-card-1.jpg', displayOrder: 0 },
      { imageKey: 'magazines/mock/seongsu-course-card-2.jpg', displayOrder: 1 },
    ],
    restaurants: [
      { restaurantId: 1042, displayOrder: 0 },
      { restaurantId: 1038, displayOrder: 1 },
    ],
    createdAt: '2026-07-08T09:20:00',
    updatedAt: '2026-07-08T16:20:00',
  },
  {
    id: 198,
    title: '비 오는 날 찾기 좋은 따뜻한 한식',
    content: '비 오는 날 방문하기 좋은 한식 공간을 소개합니다.',
    region: 'OSAKA',
    series: 'THEME',
    genre: 'KOREAN',
    bannerImageKey: 'magazines/mock/rainy-korean-banner.jpg',
    bannerUrl:
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=480&q=80',
    cards: [
      { imageKey: 'magazines/mock/rainy-korean-card-1.jpg', displayOrder: 0 },
    ],
    restaurants: [{ restaurantId: 1038, displayOrder: 0 }],
    createdAt: '2026-07-06T18:30:00',
    updatedAt: '2026-07-07T11:05:00',
  },
  {
    id: 172,
    title: '혼밥 예약이 편한 조용한 식당',
    content: '혼자 방문해도 부담 없는 조용한 식당을 모았습니다.',
    region: 'KYOTO',
    series: 'EDITOR_PICK',
    genre: 'SUSHI',
    bannerImageKey: 'magazines/mock/solo-dining-banner.jpg',
    bannerUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=480&q=80',
    cards: [],
    restaurants: [{ restaurantId: 1009, displayOrder: 0 }],
    createdAt: '2026-06-21T09:00:00',
    updatedAt: '2026-07-02T08:10:00',
  },
]

const waitForMockDelay = () =>
  new Promise((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY_MS)
  })

const resolveScenario = async <TData>(
  scenario: MockScenario,
  data: TData,
  emptyData: TData,
) => {
  await waitForMockDelay()

  if (scenario === 'error') {
    throw new Error('관리자 API 응답을 불러오지 못했습니다.')
  }

  if (scenario === 'empty') {
    return emptyData
  }

  return data
}

const getNextId = (prefix: string, items: { id: string }[]) => {
  const nextNumber =
    Math.max(
      ...items.map(({ id }) => Number(id.replace(`${prefix}-`, '')) || 0),
      0,
    ) + 1

  return `${prefix}-${nextNumber}`
}

const getNextNumericId = (items: { id: number }[]) =>
  Math.max(...items.map(({ id }) => id), 0) + 1

const getNumericId = (id: string) => Number(id.replace(/^[A-Z]+-/, '')) || 0

const getMagazineBannerUrl = (bannerImageKey: string) =>
  bannerImageKey.startsWith('http')
    ? bannerImageKey
    : `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=480&q=80&key=${encodeURIComponent(
        bannerImageKey,
      )}`

const getNowLabel = () => '2026-07-09 15:00'
const getNowIso = () => '2026-07-09T15:00:00.000'

export const mockStore = {
  async listRestaurants(scenario: MockScenario) {
    return resolveScenario(scenario, [...restaurants], [])
  },
  async createRestaurant(
    input: RestaurantFormData,
  ): Promise<CreateRestaurantResponseData> {
    await waitForMockDelay()

    const restaurant: Restaurant = {
      id: getNextId('RST', restaurants),
      ...input,
      status: input.active ? 'open' : 'paused',
      isReservationAvailable: input.active,
      updatedAt: getNowLabel(),
    }

    restaurants.unshift(restaurant)
    return { restaurantId: getNumericId(restaurant.id) }
  },
  async updateRestaurant(restaurantId: string, input: RestaurantFormData) {
    await waitForMockDelay()

    const restaurantIndex = restaurants.findIndex(
      ({ id }) => id === restaurantId,
    )

    if (restaurantIndex < 0) {
      throw new Error('식당을 찾을 수 없습니다.')
    }

    const restaurant: Restaurant = {
      ...restaurants[restaurantIndex],
      ...input,
      status: input.active ? 'open' : 'paused',
      isReservationAvailable: input.active,
      updatedAt: getNowLabel(),
    }

    restaurants[restaurantIndex] = restaurant
    return null
  },
  async deleteRestaurant(restaurantId: string) {
    await waitForMockDelay()

    const restaurantIndex = restaurants.findIndex(
      ({ id }) => id === restaurantId,
    )

    if (restaurantIndex < 0) {
      throw new Error('식당을 찾을 수 없습니다.')
    }

    const targetRestaurant = restaurants[restaurantIndex]
    const hasActiveReservation = reservations.some(
      ({ restaurant, reservationStatus }) =>
        restaurant.name === targetRestaurant.name &&
        (reservationStatus === 'CONTACTING' ||
          reservationStatus === 'CONFIRMED'),
    )

    if (hasActiveReservation) {
      throw new Error('진행 중인 예약이 있어 식당을 삭제할 수 없습니다.')
    }

    restaurants.splice(restaurantIndex, 1)
    return null
  },
  async listReservations(scenario: MockScenario) {
    return resolveScenario(scenario, [...reservations], [])
  },
  async updateReservationStatus(
    reservationId: string,
    status: AdminReservationStatus,
  ): Promise<UpdateReservationStatusResponseData> {
    await waitForMockDelay()

    const reservation = reservations.find(
      ({ id }) => String(id) === reservationId,
    )

    if (!reservation) {
      throw new Error('예약을 찾을 수 없습니다.')
    }

    if (
      reservation.reservationStatus === 'CANCELLED' &&
      status !== 'CANCELLED'
    ) {
      throw new Error('변경할 수 없는 상태입니다.')
    }

    reservation.reservationStatus = status
    return {
      id: reservation.id,
      reservationStatus: status,
      updatedAt: getNowIso(),
    }
  },
  async getReservationUser(reservationId: string) {
    await waitForMockDelay()

    const reservation = reservations.find(
      ({ id }) => String(id) === reservationId,
    )

    if (!reservation) {
      throw new Error('예약을 찾을 수 없습니다.')
    }

    const user = reservationUsers[reservation.user.id]

    if (!user) {
      throw new Error('예약 유저를 찾을 수 없습니다.')
    }

    return {
      reservationId: reservation.id,
      user,
    }
  },
  async listMagazines(scenario: MockScenario) {
    return resolveScenario(scenario, [...magazines], [])
  },
  async createMagazine(
    input: MagazineFormData,
  ): Promise<CreateMagazineResponseData> {
    await waitForMockDelay()

    const magazine: Magazine = {
      id: getNextNumericId(magazines),
      ...input,
      content: input.content ?? '',
      cards: input.cards ?? [],
      restaurants: input.restaurants ?? [],
      bannerUrl: getMagazineBannerUrl(input.bannerImageKey),
      createdAt: getNowIso(),
      updatedAt: getNowIso(),
    }

    magazines.unshift(magazine)
    return {
      id: magazine.id,
      title: magazine.title,
      region: magazine.region,
      series: magazine.series,
      genre: magazine.genre,
      bannerUrl: magazine.bannerUrl,
      cardCount: magazine.cards.length,
      restaurantCount: magazine.restaurants.length,
      createdAt: magazine.createdAt,
    }
  },
  async updateMagazine(
    magazineId: string,
    input: MagazineFormData,
  ): Promise<UpdateMagazineResponseData> {
    await waitForMockDelay()

    const magazineIndex = magazines.findIndex(
      ({ id }) => String(id) === magazineId,
    )

    if (magazineIndex < 0) {
      throw new Error('매거진을 찾을 수 없습니다.')
    }

    const previousMagazine = magazines[magazineIndex]
    const magazine: Magazine = {
      ...previousMagazine,
      ...input,
      content: input.content ?? previousMagazine.content,
      cards: input.cards ?? previousMagazine.cards,
      restaurants: input.restaurants ?? previousMagazine.restaurants,
      bannerUrl: getMagazineBannerUrl(
        input.bannerImageKey ?? previousMagazine.bannerImageKey,
      ),
      updatedAt: getNowIso(),
    }

    magazines[magazineIndex] = magazine
    return {
      id: magazine.id,
      title: magazine.title,
      region: magazine.region,
      series: magazine.series,
      genre: magazine.genre,
      bannerUrl: magazine.bannerUrl,
      cardCount: magazine.cards.length,
      restaurantCount: magazine.restaurants.length,
      updatedAt: magazine.updatedAt,
    }
  },
  async deleteMagazine(magazineId: string) {
    await waitForMockDelay()

    const magazineIndex = magazines.findIndex(
      ({ id }) => String(id) === magazineId,
    )

    if (magazineIndex < 0) {
      throw new Error('매거진을 찾을 수 없습니다.')
    }

    magazines.splice(magazineIndex, 1)
  },
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await waitForMockDelay()

    return {
      totalRestaurants: restaurants.length,
      todayReservations: reservations.filter(({ reservedAt }) =>
        reservedAt.startsWith('2026-07-09'),
      ).length,
      pendingReservations: reservations.filter(
        ({ reservationStatus }) => reservationStatus === 'CONTACTING',
      ).length,
      magazineCount: magazines.length,
    }
  },
}
