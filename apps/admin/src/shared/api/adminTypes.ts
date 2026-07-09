export type MockScenario = 'success' | 'empty' | 'error'

export type RestaurantStatus = 'open' | 'paused' | 'closed'
export type RestaurantGenre =
  | 'sushi'
  | 'noodle'
  | 'rice-bowl'
  | 'nabe'
  | 'fried'
  | 'grill'
  | 'etc'
export type RestaurantCurationType =
  | 'sns-hot'
  | 'popular'
  | 'hashi-pick'
  | 'today-restaurant'
export type CurrencyCode = 'JPY' | 'KRW'
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'
export type AdminReservationStatus =
  | 'CONTACTING'
  | 'CONFIRMED'
  | 'VISITED'
  | 'CANCELLED'
export type ReservationStatus = AdminReservationStatus
export type ReservationPaymentStatus =
  | 'PAID'
  | 'UNPAID'
  | 'CANCELLED'
  | 'REFUNDED'
export type MagazineRegion = 'TOKYO' | 'OSAKA' | 'KYOTO' | 'FUKUOKA' | 'SAPPORO'
export type MagazineSeries = 'WEEKLY' | 'THEME' | 'EDITOR_PICK' | 'SEASONAL'
export type MagazineGenre =
  | 'IZAKAYA'
  | 'SUSHI'
  | 'RAMEN'
  | 'YAKINIKU'
  | 'CAFE'
  | 'KOREAN'
  | 'WESTERN'
export type AdminResourceId = string | number

export interface AdminFieldError {
  field: string
  rejectedValue: unknown
  reason: string
}

export interface AdminApiSuccessResponse<TData> {
  success: true
  code: string
  message: string
  data: TData
}

export interface AdminApiErrorResponse {
  success: false
  code: string
  message: string
  data: null
  timestamp: string
  path: string
  errors?: AdminFieldError[]
}

export type AdminApiResponse<TData> =
  | AdminApiSuccessResponse<TData>
  | AdminApiErrorResponse

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface Restaurant {
  id: string
  name: string
  localName: string
  description: string
  address: string
  area: string
  genre: RestaurantGenre
  thumbnailFileKey: string
  imageFileKeys: string[]
  reservationFee: number
  priceRange: RestaurantPriceRangeRequest
  businessHours: RestaurantBusinessHourRequest[]
  menus: CreateRestaurantMenuRequest[]
  curationTypes: RestaurantCurationType[]
  active: boolean
  status: RestaurantStatus
  isReservationAvailable: boolean
  updatedAt: string
}

export type RestaurantFormData = CreateRestaurantRequest & {
  localName: string
  imageFileKeys: string[]
  menus: CreateRestaurantMenuRequest[]
  curationTypes: RestaurantCurationType[]
  active: boolean
}

export interface RestaurantPriceRangeRequest {
  currency: CurrencyCode
  minPrice: number
  maxPrice: number
}

export interface RestaurantBusinessHourRequest {
  dayOfWeek: DayOfWeek
  openTime?: string | null
  closeTime?: string | null
  lastOrderTime?: string | null
  closed: boolean
}

export interface CreateRestaurantMenuRequest {
  name: string
  description?: string
  imageFileKey?: string
  currency: CurrencyCode
  price: number
  representative: boolean
}

export interface UpdateRestaurantMenuRequest extends CreateRestaurantMenuRequest {
  menuId?: number
}

export interface CreateRestaurantRequest {
  name: string
  localName?: string
  description: string
  address: string
  area: string
  genre: RestaurantGenre
  thumbnailFileKey: string
  imageFileKeys?: string[]
  reservationFee: number
  priceRange: RestaurantPriceRangeRequest
  businessHours: RestaurantBusinessHourRequest[]
  menus?: CreateRestaurantMenuRequest[]
  curationTypes?: RestaurantCurationType[]
  active?: boolean
}

export interface UpdateRestaurantRequest {
  name?: string
  localName?: string
  description?: string
  address?: string
  area?: string
  genre?: RestaurantGenre
  thumbnailFileKey?: string
  imageFileKeys?: string[]
  reservationFee?: number
  priceRange?: Partial<RestaurantPriceRangeRequest>
  businessHours?: RestaurantBusinessHourRequest[]
  menus?: UpdateRestaurantMenuRequest[]
  curationTypes?: RestaurantCurationType[]
  active?: boolean
}

export interface CreateRestaurantResponseData {
  restaurantId: number
}

export interface ListReservationsRequest {
  status?: AdminReservationStatus
  reservedFrom?: string
  reservedTo?: string
  page?: number
  size?: number
}

export interface AdminReservationSummary {
  id: number
  appliedAt: string
  reservedAt: string
  reservationStatus: AdminReservationStatus
  paymentStatus: ReservationPaymentStatus
  restaurant: {
    id: number
    name: string
  }
  user: {
    id: number
    nickname: string
    phone: string
  }
  adultCount: number
  teenCount: number
  childCount: number
  amount: number | null
}

export interface ListReservationsResponseData {
  reservations: AdminReservationSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface UpdateReservationStatusRequest {
  status: AdminReservationStatus
}

export interface UpdateReservationStatusResponseData {
  id: number
  reservationStatus: AdminReservationStatus
  updatedAt: string
}

export interface ReservationUserResponseData {
  reservationId: number
  user: {
    id: number
    nickname: string
    nameEng: string | null
    birthDate: string
    phone: string
    email: string | null
    profileImageUrl: string | null
  }
}

export interface Magazine {
  id: number
  title: string
  content: string
  region: MagazineRegion
  series: MagazineSeries
  genre: MagazineGenre
  bannerImageKey: string
  bannerUrl: string | null
  cards: MagazineCardRequest[]
  restaurants: MagazineRestaurantRequest[]
  createdAt: string
  updatedAt: string
}

export interface MagazineCardRequest {
  imageKey: string
  displayOrder: number
}

export interface MagazineRestaurantRequest {
  restaurantId: number
  displayOrder: number
}

export interface CreateMagazineRequest {
  title: string
  content?: string
  region: MagazineRegion
  series: MagazineSeries
  genre: MagazineGenre
  bannerImageKey: string
  cards?: MagazineCardRequest[]
  restaurants?: MagazineRestaurantRequest[]
}

export interface UpdateMagazineRequest {
  title?: string
  content?: string
  region?: MagazineRegion
  series?: MagazineSeries
  genre?: MagazineGenre
  bannerImageKey?: string
  cards?: MagazineCardRequest[]
  restaurants?: MagazineRestaurantRequest[]
}

export interface MagazineFormData extends CreateMagazineRequest {
  content: string
  cards: MagazineCardRequest[]
  restaurants: MagazineRestaurantRequest[]
}

export interface CreateMagazineResponseData {
  id: number
  title: string
  region: MagazineRegion
  series: MagazineSeries
  genre: MagazineGenre
  bannerUrl: string | null
  cardCount: number
  restaurantCount: number
  createdAt: string
}

export interface UpdateMagazineResponseData {
  id: number
  title: string
  region: MagazineRegion
  series: MagazineSeries
  genre: MagazineGenre
  bannerUrl: string | null
  cardCount: number
  restaurantCount: number
  updatedAt: string
}

export interface DashboardMetrics {
  totalRestaurants: number
  todayReservations: number
  pendingReservations: number
  magazineCount: number
}
