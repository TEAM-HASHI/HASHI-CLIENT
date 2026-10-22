import type {
  CreateMagazineBody,
  UpdateMagazineBody,
} from '@/shared/api/magazineApi'
import type { UploadedImage } from '@/shared/api/uploadApi'
import type { MagazineDetailData } from '@/pages/magazines/api/magazineCatalogApi'

export const MAGAZINE_RESTAURANT_LIMIT = 10
export const MAGAZINE_CARD_NEWS_LIMIT = 20

export interface MagazineRestaurant {
  restaurantId: number
  name: string
  area?: string
  imageUrl?: string
}

export interface MagazineFormState {
  title: string
  banner: UploadedImage | null
  thumbnail: UploadedImage | null
  existingBannerUrl: string | null
  existingThumbnailUrl: string | null
  instagramRedirectUrl: string
  content: string
  hashtags: string
  restaurants: MagazineRestaurant[]
  cardNews: UploadedImage[]
  replaceCardNews: boolean
}

export type MagazineTextField =
  | 'title'
  | 'instagramRedirectUrl'
  | 'content'
  | 'hashtags'
export type MagazineDirtyFields = Set<MagazineTextField | 'restaurantIds'>

export const createMagazineForm = (): MagazineFormState => ({
  title: '',
  banner: null,
  thumbnail: null,
  existingBannerUrl: null,
  existingThumbnailUrl: null,
  instagramRedirectUrl: '',
  content: '',
  hashtags: '',
  restaurants: [],
  cardNews: [],
  replaceCardNews: false,
})

export const createMagazineFormFromItem = (
  item: {
    title?: string
    bannerImageUrl?: string
    thumbnailImageUrl?: string
    instagramRedirectUrl?: string
  },
  detail?: MagazineDetailData,
): MagazineFormState => ({
  ...createMagazineForm(),
  title: detail?.title ?? item.title ?? '',
  banner: null,
  thumbnail: null,
  existingBannerUrl: item.bannerImageUrl ?? null,
  existingThumbnailUrl: item.thumbnailImageUrl ?? null,
  instagramRedirectUrl: item.instagramRedirectUrl ?? '',
  content: detail?.content ?? '',
  hashtags: detail?.hashtags?.join(', ') ?? '',
  restaurants: (detail?.restaurants ?? []).map((restaurant) => ({
    restaurantId: restaurant.restaurantId!,
    name: restaurant.name ?? `식당 #${restaurant.restaurantId}`,
    area: restaurant.area,
    imageUrl: restaurant.imageUrls?.[0],
  })),
})

const splitList = (value: string) =>
  value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean)

const detailBody = (form: MagazineFormState) => ({
  content: form.content,
  hashtags: splitList(form.hashtags),
  restaurantIds: form.restaurants.map((restaurant) => restaurant.restaurantId),
})

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const validateMagazineForm = (
  form: MagazineFormState,
  mode: 'create' | 'update',
  dirtyFields: MagazineDirtyFields,
) => {
  const errors: Record<string, string> = {}
  if (
    (mode === 'create' || dirtyFields.has('title')) &&
    (!form.title.trim() || form.title.trim().length > 150)
  ) {
    errors.title = '제목은 1자 이상 150자 이하로 입력해주세요.'
  }
  if (mode === 'create' && !form.banner) {
    errors.banner = '배너 이미지를 업로드해주세요.'
  }
  if (mode === 'create' && !form.thumbnail) {
    errors.thumbnail = '썸네일 이미지를 업로드해주세요.'
  }
  if (
    (mode === 'create' || dirtyFields.has('instagramRedirectUrl')) &&
    (form.instagramRedirectUrl.length > 255 ||
      !isValidHttpUrl(form.instagramRedirectUrl))
  ) {
    errors.instagramRedirectUrl = '올바른 http(s) URL을 입력해주세요.'
  }
  if (
    (mode === 'create' || dirtyFields.has('content')) &&
    form.content.length > 2000
  )
    errors.content = '본문은 2000자 이내로 입력해주세요.'
  if (mode === 'create' || dirtyFields.has('hashtags')) {
    const tags = splitList(form.hashtags)
    if (
      tags.some((tag) => tag.length > 20) ||
      new Set(tags).size !== tags.length
    )
      errors.hashtags = '해시태그는 각 20자 이하로 중복 없이 입력해주세요.'
  }
  if (mode === 'create' || dirtyFields.has('restaurantIds')) {
    const ids = form.restaurants.map((restaurant) => restaurant.restaurantId)
    if (
      ids.length > MAGAZINE_RESTAURANT_LIMIT ||
      ids.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
      new Set(ids).size !== ids.length
    )
      errors.restaurantIds = '연결 식당은 중복 없이 최대 10개까지 선택해주세요.'
  }
  if (
    (mode === 'create' || form.replaceCardNews) &&
    new Set(form.cardNews.map((image) => image.fileKey)).size !==
      form.cardNews.length
  )
    errors.cardNews = '같은 카드뉴스 이미지는 중복해서 등록할 수 없습니다.'
  if (
    (mode === 'create' || form.replaceCardNews) &&
    form.cardNews.length > MAGAZINE_CARD_NEWS_LIMIT
  )
    errors.cardNews = '카드뉴스는 최대 20장까지 등록할 수 있습니다.'
  return errors
}

export const toCreateMagazineBody = (
  form: MagazineFormState,
): CreateMagazineBody => {
  if (!form.banner) throw new Error('배너 이미지를 업로드해주세요.')
  if (!form.thumbnail) throw new Error('썸네일 이미지를 업로드해주세요.')
  return {
    title: form.title.trim(),
    bannerKey: form.banner.fileKey,
    thumbnailKey: form.thumbnail.fileKey,
    instagramRedirectUrl: form.instagramRedirectUrl.trim(),
    ...detailBody(form),
    cardNews: form.cardNews.map((image) => ({ imageKey: image.fileKey })),
  }
}

export const toUpdateMagazineBody = (
  form: MagazineFormState,
  dirtyFields: MagazineDirtyFields,
): UpdateMagazineBody => {
  const body: UpdateMagazineBody = {}
  if (dirtyFields.has('title')) body.title = form.title.trim()
  if (dirtyFields.has('instagramRedirectUrl')) {
    body.instagramRedirectUrl = form.instagramRedirectUrl.trim()
  }
  if (form.banner) body.bannerKey = form.banner.fileKey
  if (form.thumbnail) body.thumbnailKey = form.thumbnail.fileKey
  const detail = detailBody(form)
  if (dirtyFields.has('content')) body.content = detail.content
  if (dirtyFields.has('hashtags')) body.hashtags = detail.hashtags
  if (dirtyFields.has('restaurantIds'))
    body.restaurantIds = detail.restaurantIds
  if (form.replaceCardNews)
    body.cardNews = form.cardNews.map((image) => ({ imageKey: image.fileKey }))
  if (Object.keys(body).length === 0) {
    throw new Error('수정할 필드를 하나 이상 입력해주세요.')
  }
  return body
}
