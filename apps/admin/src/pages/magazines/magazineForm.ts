import type {
  CreateMagazineBody,
  UpdateMagazineBody,
} from '@/shared/api/magazineApi'
import type { UploadedImage } from '@/shared/api/uploadApi'

export interface MagazineFormState {
  title: string
  banner: UploadedImage | null
  thumbnail: UploadedImage | null
  existingBannerUrl: string | null
  existingThumbnailUrl: string | null
  instagramRedirectUrl: string
}

export type MagazineDirtyFields = Set<'title' | 'instagramRedirectUrl'>

export const createMagazineForm = (): MagazineFormState => ({
  title: '',
  banner: null,
  thumbnail: null,
  existingBannerUrl: null,
  existingThumbnailUrl: null,
  instagramRedirectUrl: '',
})

export const createMagazineFormFromItem = (item: {
  title?: string
  bannerImageUrl?: string
  thumbnailImageUrl?: string
  instagramRedirectUrl?: string
}): MagazineFormState => ({
  title: item.title ?? '',
  banner: null,
  thumbnail: null,
  existingBannerUrl: item.bannerImageUrl ?? null,
  existingThumbnailUrl: item.thumbnailImageUrl ?? null,
  instagramRedirectUrl: item.instagramRedirectUrl ?? '',
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
  if (Object.keys(body).length === 0) {
    throw new Error('수정할 필드를 하나 이상 입력해주세요.')
  }
  return body
}
