import type { components, paths } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type RestaurantLocation =
  components['schemas']['RestaurantLocationResponse']
export type LocationReview =
  components['schemas']['RestaurantLocationReviewResponse']
export type LocationReviews =
  components['schemas']['RestaurantLocationReviewListResponse']
export type LocationFilters = NonNullable<
  paths['/api/v1/admin/restaurants/locations']['get']['parameters']['query']
>

// OpenAPI's Candidate currently resolves to the image DTO; fields follow RestaurantPlacesSearchResponse.Candidate.
export interface PlaceCandidate {
  displayName: string
  address: string
  latitude: number
  longitude: number
  countryCode?: string
  administrativeArea?: string
  types?: string[]
  businessStatus?: string
  attributions?: { displayName: string; uri?: string }[]
  googleMapsUri?: string
  selectionToken: string
  selectionExpiresAt: string
}
export interface PlaceCandidates {
  restaurantId: number
  addressRevision: number
  candidates: PlaceCandidate[]
}
export type LocationPreviewInput =
  components['schemas']['PreviewRestaurantLocationRequest']

const validCandidates = (items: PlaceCandidate[]) =>
  Array.isArray(items) &&
  items.every(
    (item) =>
      item &&
      typeof item.displayName === 'string' &&
      typeof item.address === 'string' &&
      Number.isFinite(item.latitude) &&
      Math.abs(item.latitude) <= 90 &&
      Number.isFinite(item.longitude) &&
      Math.abs(item.longitude) <= 180 &&
      typeof item.selectionToken === 'string' &&
      item.selectionToken.length > 0 &&
      item.selectionToken.length <= 2048 &&
      Number.isFinite(Date.parse(item.selectionExpiresAt)),
  )

const endpoint = '/api/v1/admin/restaurants'
const locationPath = (id: number) => `${endpoint}/${id}/location`

export const restaurantLocationApi = {
  async preview(input: LocationPreviewInput, signal?: AbortSignal) {
    const result = await request<{ candidates: PlaceCandidate[] }>(
      `${endpoint}/location-preview`,
      {
        method: 'post',
        json: input,
        signal,
        cache: 'no-store',
      },
    )
    if (!validCandidates(result?.candidates))
      throw new Error('장소 후보 응답을 확인할 수 없습니다. 다시 검색해주세요.')
    return result
  },
  list: (filters: LocationFilters, signal?: AbortSignal) =>
    request<LocationReviews>(`${endpoint}/locations`, {
      searchParams: { ...filters, size: 20 },
      signal,
      cache: 'no-store',
    }),
  status: (id: number, signal?: AbortSignal) =>
    request<RestaurantLocation>(locationPath(id), {
      signal,
      cache: 'no-store',
    }),
  retry: (id: number, revision: number, signal?: AbortSignal) =>
    request<RestaurantLocation>(`${locationPath(id)}/retry`, {
      method: 'post',
      json: { expectedAddressRevision: revision },
      signal,
    }),
  async candidates(id: number, revision: number, signal?: AbortSignal) {
    const result = await request<PlaceCandidates>(
      `${locationPath(id)}/place-candidates`,
      {
        method: 'post',
        json: { expectedAddressRevision: revision },
        signal,
        cache: 'no-store',
      },
    )
    if (
      result.restaurantId !== id ||
      result.addressRevision !== revision ||
      !validCandidates(result.candidates)
    )
      throw new Error('장소 후보 응답을 확인할 수 없습니다. 다시 검색해주세요.')
    return result
  },
  select: (id: number, revision: number, token: string, signal?: AbortSignal) =>
    request<RestaurantLocation>(`${locationPath(id)}/place-selection`, {
      method: 'post',
      json: { expectedAddressRevision: revision, selectionToken: token },
      signal,
    }),
}
