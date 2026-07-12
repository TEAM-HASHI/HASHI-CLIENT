import type { RestaurantPrefillView } from '@/pages/restaurants/restaurantViewModel'
import type {
  CreateRestaurantBody,
  UpdateRestaurantBody,
} from '@/shared/api/restaurantApi'
import type { UploadedImage } from '@/shared/api/uploadApi'

type BusinessHourBody = CreateRestaurantBody['businessHours'][number]
type DayOfWeek = BusinessHourBody['dayOfWeek']
type MenuBody = NonNullable<CreateRestaurantBody['menus']>[number]

export interface RestaurantBusinessHourForm {
  dayOfWeek: DayOfWeek
  openTime: string
  closeTime: string
  breakStart: string
  breakEnd: string
  closed: boolean
}

export interface RestaurantMenuForm {
  name: string
  description: string
  image: UploadedImage | null
  existingImageUrl: string | null
  priceCurrency: string
  priceAmount: string
  main: boolean
}

export interface RestaurantScalarFields {
  name: string
  localName: string
  summary: string
  description: string
  address: string
  area: string
  genre: string
  foodCategory: string
  priceCurrency: string
  minPrice: string
  maxPrice: string
}

export interface RestaurantFormState extends RestaurantScalarFields {
  images: UploadedImage[]
  existingImageUrls: string[]
  menus: RestaurantMenuForm[]
  hashtags: string[]
  curationTypes: string[]
  businessHours: RestaurantBusinessHourForm[]
}

export interface RestaurantReplacementFlags {
  images: boolean
  menus: boolean
  hashtags: boolean
  curationTypes: boolean
  businessHours: boolean
}

export type RestaurantDirtyFields = Set<keyof RestaurantScalarFields>

export interface FormUploadStatus {
  pendingCount: number
  failedCount: number
}

export type RestaurantFormErrors = Record<string, string>

const DAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const createBusinessHours = (): RestaurantBusinessHourForm[] =>
  DAYS.map((dayOfWeek) => ({
    dayOfWeek,
    openTime: '11:00',
    closeTime: '22:00',
    breakStart: '',
    breakEnd: '',
    closed: false,
  }))

export const createRestaurantForm = (): RestaurantFormState => ({
  name: '',
  localName: '',
  summary: '',
  description: '',
  address: '',
  area: '',
  genre: 'sushi',
  foodCategory: 'sushi',
  priceCurrency: 'JPY',
  minPrice: '',
  maxPrice: '',
  images: [],
  existingImageUrls: [],
  menus: [],
  hashtags: [],
  curationTypes: [],
  businessHours: createBusinessHours(),
})

export const createRestaurantFormFromPrefill = (
  view: RestaurantPrefillView,
): RestaurantFormState => {
  const defaultHours = createBusinessHours()
  const hoursByDay = new Map(
    view.businessHours.map((hour) => [hour.dayOfWeek, hour]),
  )

  return {
    name: view.name,
    localName: view.localName,
    summary: view.summary,
    description: view.description,
    address: view.address,
    area: view.area,
    genre: view.genre,
    foodCategory: view.foodCategory,
    priceCurrency: view.priceCurrency || 'JPY',
    minPrice: view.minPrice == null ? '' : String(view.minPrice),
    maxPrice: view.maxPrice == null ? '' : String(view.maxPrice),
    images: [],
    existingImageUrls: view.images.map(({ sourceUrl }) => sourceUrl),
    menus: view.menus.map((menu) => ({
      name: menu.name,
      description: menu.description,
      image: null,
      existingImageUrl: menu.image?.sourceUrl ?? null,
      priceCurrency: menu.priceCurrency || 'JPY',
      priceAmount: menu.priceAmount == null ? '' : String(menu.priceAmount),
      main: menu.main,
    })),
    hashtags: view.hashtags,
    curationTypes: view.curationTypes,
    businessHours: defaultHours.map((fallback) => {
      const value = hoursByDay.get(fallback.dayOfWeek)
      return value
        ? {
            dayOfWeek: fallback.dayOfWeek,
            openTime: value.openTime ?? '',
            closeTime: value.closeTime ?? '',
            breakStart: value.breakStart ?? '',
            breakEnd: value.breakEnd ?? '',
            closed: value.closed ?? false,
          }
        : fallback
    }),
  }
}

const parseMoney = (value: string, fieldName: string) => {
  const amount = Number(value)
  if (!value.trim() || !Number.isFinite(amount) || amount < 0) {
    throw new Error(`${fieldName}은(는) 0 이상의 숫자여야 합니다.`)
  }
  return amount
}

const serializeBusinessHours = (
  hours: RestaurantBusinessHourForm[],
): BusinessHourBody[] =>
  hours.map((hour) => {
    if (hour.closed) {
      return { dayOfWeek: hour.dayOfWeek, closed: true }
    }

    return {
      dayOfWeek: hour.dayOfWeek,
      closed: false,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      ...(hour.breakStart && hour.breakEnd
        ? { breakStart: hour.breakStart, breakEnd: hour.breakEnd }
        : {}),
    }
  })

const serializeMenus = (menus: RestaurantMenuForm[]): MenuBody[] =>
  menus.map((menu) => ({
    name: menu.name.trim(),
    description: menu.description.trim(),
    ...(menu.image ? { imageKey: menu.image.fileKey } : {}),
    priceCurrency: menu.priceCurrency,
    priceAmount: parseMoney(menu.priceAmount, '메뉴 가격'),
    main: menu.main,
  }))

export const toCreateRestaurantBody = (
  form: RestaurantFormState,
): CreateRestaurantBody => ({
  name: form.name.trim(),
  localName: form.localName.trim(),
  summary: form.summary.trim(),
  description: form.description.trim(),
  address: form.address.trim(),
  area: form.area.trim(),
  genre: form.genre,
  foodCategory: form.foodCategory,
  priceCurrency: form.priceCurrency,
  minPrice: parseMoney(form.minPrice, '최소 가격'),
  maxPrice: parseMoney(form.maxPrice, '최대 가격'),
  imageKeys: form.images.map(({ fileKey }) => fileKey),
  menus: serializeMenus(form.menus),
  hashtags: form.hashtags.map((hashtag) => hashtag.trim()),
  curationTypes: form.curationTypes,
  businessHours: serializeBusinessHours(form.businessHours),
})

export const toUpdateRestaurantBody = (
  form: RestaurantFormState,
  dirtyFields: RestaurantDirtyFields,
  replacements: RestaurantReplacementFlags,
): UpdateRestaurantBody => {
  const body: UpdateRestaurantBody = {}

  dirtyFields.forEach((field) => {
    if (field === 'minPrice' || field === 'maxPrice') {
      body[field] = parseMoney(
        form[field],
        field === 'minPrice' ? '최소 가격' : '최대 가격',
      )
      return
    }
    body[field] = form[field].trim()
  })

  if (replacements.images) {
    body.imageKeys = form.images.map(({ fileKey }) => fileKey)
  }
  if (replacements.menus) {
    body.menus = serializeMenus(form.menus)
  }
  if (replacements.hashtags) {
    body.hashtags = form.hashtags.map((hashtag) => hashtag.trim())
  }
  if (replacements.curationTypes) {
    body.curationTypes = form.curationTypes
  }
  if (replacements.businessHours) {
    body.businessHours = serializeBusinessHours(form.businessHours)
  }

  if (Object.keys(body).length === 0) {
    throw new Error('수정할 필드를 하나 이상 선택해주세요.')
  }

  return body
}

const hasInvalidLength = (value: string, max: number) =>
  value.trim().length === 0 || value.trim().length > max

const validateHours = (hours: RestaurantBusinessHourForm[]) => {
  if (
    hours.length !== DAYS.length ||
    new Set(hours.map(({ dayOfWeek }) => dayOfWeek)).size !== DAYS.length
  ) {
    return false
  }

  return hours.every((hour) => {
    if (hour.closed) {
      return (
        !hour.openTime && !hour.closeTime && !hour.breakStart && !hour.breakEnd
      )
    }
    if (!hour.openTime || !hour.closeTime || hour.openTime >= hour.closeTime) {
      return false
    }
    if (Boolean(hour.breakStart) !== Boolean(hour.breakEnd)) {
      return false
    }
    if (hour.breakStart && hour.breakEnd) {
      return (
        hour.openTime <= hour.breakStart &&
        hour.breakStart < hour.breakEnd &&
        hour.breakEnd <= hour.closeTime
      )
    }
    return true
  })
}

export const validateRestaurantForm = (
  form: RestaurantFormState,
  mode: 'create' | 'update',
  replacements: RestaurantReplacementFlags,
  uploadStatus: FormUploadStatus,
  dirtyFields: RestaurantDirtyFields = new Set(),
): RestaurantFormErrors => {
  const errors: RestaurantFormErrors = {}
  const needsScalar = (field: keyof RestaurantScalarFields) =>
    mode === 'create' || dirtyFields.has(field)

  const textLimits: Array<[keyof RestaurantScalarFields, number]> = [
    ['name', 100],
    ['localName', 100],
    ['summary', 100],
    ['description', 500],
    ['address', 255],
    ['area', 20],
  ]
  textLimits.forEach(([field, max]) => {
    if (needsScalar(field) && hasInvalidLength(form[field], max)) {
      errors[field] = `필수 입력이며 ${max}자 이하여야 합니다.`
    }
  })

  if (needsScalar('genre') && !form.genre) errors.genre = '장르를 선택해주세요.'
  if (needsScalar('foodCategory') && !form.foodCategory) {
    errors.foodCategory = '음식 카테고리를 선택해주세요.'
  }
  if (needsScalar('priceCurrency') && form.priceCurrency.length !== 3) {
    errors.priceCurrency = '통화를 선택해주세요.'
  }

  if (mode === 'create') {
    const minPrice = Number(form.minPrice)
    const maxPrice = Number(form.maxPrice)
    if (
      !form.minPrice.trim() ||
      !form.maxPrice.trim() ||
      !Number.isFinite(minPrice) ||
      !Number.isFinite(maxPrice) ||
      minPrice < 0 ||
      maxPrice < 0 ||
      minPrice > maxPrice
    ) {
      errors.priceRange = '가격 범위를 올바르게 입력해주세요.'
    }
  } else {
    const invalidDirtyPrice = (field: 'minPrice' | 'maxPrice') => {
      if (!dirtyFields.has(field)) return false
      const value = Number(form[field])
      return !form[field].trim() || !Number.isFinite(value) || value < 0
    }
    if (
      invalidDirtyPrice('minPrice') ||
      invalidDirtyPrice('maxPrice') ||
      (form.minPrice.trim() &&
        form.maxPrice.trim() &&
        Number(form.minPrice) > Number(form.maxPrice))
    ) {
      errors.priceRange = '가격 범위를 올바르게 입력해주세요.'
    }
  }

  if ((mode === 'create' || replacements.images) && form.images.length === 0) {
    errors.images = '식당 이미지를 한 장 이상 업로드해주세요.'
  }
  if (
    (mode === 'create' || replacements.hashtags) &&
    (form.hashtags.length === 0 ||
      form.hashtags.some(
        (hashtag) => !hashtag.trim() || hashtag.trim().length > 20,
      ))
  ) {
    errors.hashtags = '해시태그를 1개 이상, 각 20자 이하로 입력해주세요.'
  }
  if (
    (mode === 'create' || replacements.businessHours) &&
    !validateHours(form.businessHours)
  ) {
    errors.businessHours = '7개 요일의 영업시간을 올바르게 입력해주세요.'
  }
  if (
    (mode === 'create' || replacements.menus) &&
    form.menus.some((menu) => {
      const price = Number(menu.priceAmount)
      return (
        !menu.name.trim() ||
        menu.name.trim().length > 100 ||
        !menu.description.trim() ||
        menu.description.trim().length > 500 ||
        !menu.priceAmount.trim() ||
        !Number.isFinite(price) ||
        price < 0 ||
        menu.priceCurrency.length !== 3
      )
    })
  ) {
    errors.menus = '메뉴명, 설명, 통화, 가격을 올바르게 입력해주세요.'
  }
  if (uploadStatus.pendingCount > 0 || uploadStatus.failedCount > 0) {
    errors.uploads = '업로드 중이거나 실패한 이미지를 확인해주세요.'
  }

  return errors
}
