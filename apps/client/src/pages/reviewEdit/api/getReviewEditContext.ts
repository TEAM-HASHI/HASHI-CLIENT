import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type ReviewEditContextData =
  components['schemas']['ReviewEditContextResponse']
type ReviewEditImage = NonNullable<ReviewEditContextData['images']>[number]
type ValidReviewEditImage = ReviewEditImage & {
  fileKey: string
  imageUrl: string
}
export type ValidReviewEditContextData = Omit<
  ReviewEditContextData,
  'images'
> & { images: ValidReviewEditImage[] }

const hasRequiredImageFields = (
  image: ReviewEditImage,
): image is ValidReviewEditImage => Boolean(image.fileKey && image.imageUrl)

export const getReviewEditContext = async (
  reviewId: number,
): Promise<ValidReviewEditContextData> => {
  const data = await request<ReviewEditContextData>(
    `/api/v1/reviews/me/${reviewId}/edit-context`,
  )

  if (!data) {
    throw new Error('리뷰 수정 정보를 확인할 수 없습니다.')
  }

  const images = data.images

  if (
    !Array.isArray(images) ||
    images.length > 10 ||
    !images.every(hasRequiredImageFields) ||
    new Set(images.map(({ fileKey }) => fileKey)).size !== images.length
  ) {
    throw new Error('리뷰 사진 정보를 확인할 수 없습니다.')
  }

  return { ...data, images }
}
