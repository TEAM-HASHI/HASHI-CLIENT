import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import type { components, paths } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type ListReservationsQuery = NonNullable<
  paths['/api/v1/admin/reservations']['get']['parameters']['query']
>
export type ChangeReservationStatusBody =
  paths['/api/v1/admin/reservations/{reservationId}/status']['post']['requestBody']['content']['application/json']
export type AdminReservationListData =
  components['schemas']['AdminReservationListResponse']
export type AdminReservationData =
  components['schemas']['AdminReservationResponse']
export type AdminReservationUserData =
  components['schemas']['AdminReservationUserResponse']

type ReservationId =
  paths['/api/v1/admin/reservations/{reservationId}/status']['post']['parameters']['path']['reservationId']

const getReservationSearchParams = ({
  status,
  page,
  size,
}: ListReservationsQuery) => {
  const searchParams = new URLSearchParams()

  if (status) {
    searchParams.set('status', status)
  }

  if (page != null) {
    searchParams.set('page', String(page))
  }

  if (size != null) {
    searchParams.set('size', String(size))
  }

  return searchParams
}

export const reservationApi = {
  listReservations(params: ListReservationsQuery = {}) {
    return request<AdminReservationListData>(ADMIN_ENDPOINTS.reservations, {
      method: 'get',
      searchParams: getReservationSearchParams(params),
    })
  },
  updateReservationStatus(
    reservationId: ReservationId,
    input: ChangeReservationStatusBody,
  ) {
    return request<AdminReservationData>(
      ADMIN_ENDPOINTS.reservationStatus(reservationId),
      {
        method: 'post',
        json: input,
      },
    )
  },
  getReservationUser(reservationId: ReservationId) {
    return request<AdminReservationUserData>(
      ADMIN_ENDPOINTS.reservationUser(reservationId),
      { method: 'get' },
    )
  },
}
