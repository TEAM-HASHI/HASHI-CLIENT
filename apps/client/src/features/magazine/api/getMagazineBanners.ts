import { request } from '@/shared/api'
import type { components } from '@/shared/api/generated/openapi'

export type MagazineBannerListData =
  components['schemas']['MagazineBannerListResponse']

export const getMagazineBanners = async () => {
  const data = await request<MagazineBannerListData>(
    '/api/v1/magazines/banners',
  )

  return data ?? { banners: [] }
}
