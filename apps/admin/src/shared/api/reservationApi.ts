import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import { request } from '@/shared/api/request'
import type {
  AdminResourceId,
  ListReservationsRequest,
  ListReservationsResponseData,
  ReservationUserResponseData,
  UpdateReservationStatusRequest,
  UpdateReservationStatusResponseData,
} from '@/shared/api/adminTypes'

const getReservationSearchParams = ({
  status,
  reservedFrom,
  reservedTo,
  page,
  size,
}: ListReservationsRequest) => {
  const searchParams = new URLSearchParams()

  if (status) {
    searchParams.set('status', status)
  }

  if (reservedFrom) {
    searchParams.set('reservedFrom', reservedFrom)
  }

  if (reservedTo) {
    searchParams.set('reservedTo', reservedTo)
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
  listReservations(params: ListReservationsRequest = {}) {
    return request<ListReservationsResponseData>(ADMIN_ENDPOINTS.reservations, {
      method: 'get',
      searchParams: getReservationSearchParams(params),
    })
  },
  updateReservationStatus(
    reservationId: AdminResourceId,
    input: UpdateReservationStatusRequest,
  ) {
    return request<UpdateReservationStatusResponseData>(
      ADMIN_ENDPOINTS.reservationStatus(reservationId),
      {
        method: 'post',
        json: input,
      },
    )
  },
  getReservationUser(reservationId: AdminResourceId) {
    return request<ReservationUserResponseData>(
      ADMIN_ENDPOINTS.reservationUser(reservationId),
      { method: 'get' },
    )
  },
}
