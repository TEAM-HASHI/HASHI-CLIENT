import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

type MagazineDetailSchema = components['schemas']['MagazineDetailResponse']

export type MagazineLikeResponse = Required<
  components['schemas']['MagazineLikeResponse']
>

export type MagazineDetailResponse = MagazineDetailSchema &
  MagazineLikeResponse &
  Required<
    Pick<
      MagazineDetailSchema,
      'title' | 'cardNewsImageUrls' | 'restaurants' | 'hashtags' | 'createdAt'
    >
  >

const checkLikeResponse = (
  data: components['schemas']['MagazineLikeResponse'] | null,
  magazineId: number,
): data is MagazineLikeResponse =>
  data?.magazineId === magazineId &&
  typeof data.liked === 'boolean' &&
  typeof data.likeCount === 'number' &&
  Number.isSafeInteger(data.likeCount) &&
  data.likeCount >= 0

const checkDetailResponse = (
  data: MagazineDetailSchema | null,
  magazineId: number,
): data is MagazineDetailResponse =>
  data !== null &&
  typeof data.title === 'string' &&
  Array.isArray(data.cardNewsImageUrls) &&
  Array.isArray(data.restaurants) &&
  Array.isArray(data.hashtags) &&
  typeof data.createdAt === 'string' &&
  checkLikeResponse(data, magazineId)

export const getMagazineDetail = async (
  magazineId: number,
  signal: AbortSignal,
) => {
  const data = await request<MagazineDetailSchema>(
    `/api/v1/magazines/${magazineId}`,
    { signal },
  )
  if (!checkDetailResponse(data, magazineId))
    throw new Error('Invalid magazine detail response')
  return data
}

export const changeMagazineLike = async (
  magazineId: number,
  liked: boolean,
  signal?: AbortSignal,
) => {
  const data = await request<components['schemas']['MagazineLikeResponse']>(
    `/api/v1/magazines/${magazineId}/likes`,
    {
      method: liked ? 'post' : 'delete',
      credentials: 'include',
      signal,
    },
  )
  if (!checkLikeResponse(data, magazineId))
    throw new Error('Invalid magazine like response')
  return data
}
