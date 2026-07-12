import type { components } from '@/shared/api/generated/openapi'

type AdminReservationData = components['schemas']['AdminReservationResponse']
type AdminReservationListData =
  components['schemas']['AdminReservationListResponse']
type AdminReservationUserData =
  components['schemas']['AdminReservationUserResponse']

export type ReservationStatus =
  | NonNullable<AdminReservationData['reservationStatus']>
  | 'UNKNOWN'
export type ReservationPaymentStatus =
  | NonNullable<AdminReservationData['paymentStatus']>
  | 'UNKNOWN'
export type ReservationType =
  | NonNullable<AdminReservationData['reservationType']>
  | 'UNKNOWN'

export interface AdminReservationView {
  adultCount: number
  amount: number
  childCount: number
  confirmDDay: number
  id: number
  paymentStatus: ReservationPaymentStatus
  requestNote: string
  reservationStatus: ReservationStatus
  reservationType: ReservationType
  reservedAt: string
  reserverName: string
  restaurantAddress: string
  restaurantId: number
  restaurantImageUrl: string
  restaurantName: string
  teenCount: number
  usedPoint: number
  userId: number
}

export interface AdminReservationListView {
  page: number
  reservations: AdminReservationView[]
  size: number
  totalCount: number
  totalPages: number
}

export interface AdminReservationUserView {
  birthDate: string
  email: string
  nameEng: string
  nickname: string
  phone: string
  userId: number
}

export const toReservationView = (
  data: AdminReservationData,
): AdminReservationView => ({
  adultCount: data.adultCount ?? 0,
  amount: data.amount ?? 0,
  childCount: data.childCount ?? 0,
  confirmDDay: data.confirmDDay ?? 0,
  id: data.reservationId ?? 0,
  paymentStatus: data.paymentStatus ?? 'UNKNOWN',
  requestNote: data.requestNote ?? '',
  reservationStatus: data.reservationStatus ?? 'UNKNOWN',
  reservationType: data.reservationType ?? 'UNKNOWN',
  reservedAt: data.reservedAt ?? '',
  reserverName: data.reserverName ?? '-',
  restaurantAddress: data.restaurantAddress ?? '-',
  restaurantId: data.restaurantId ?? 0,
  restaurantImageUrl: data.restaurantImageUrl ?? '',
  restaurantName: data.restaurantName ?? '-',
  teenCount: data.teenCount ?? 0,
  usedPoint: data.usedPoint ?? 0,
  userId: data.userId ?? 0,
})

export const toReservationListView = (
  data: AdminReservationListData,
): AdminReservationListView => ({
  page: data.page ?? 0,
  reservations: (data.reservations ?? []).map(toReservationView),
  size: data.size ?? 20,
  totalCount: data.totalCount ?? 0,
  totalPages: data.totalPages ?? 0,
})

export const toReservationUserView = (
  data: AdminReservationUserData,
): AdminReservationUserView => ({
  birthDate: data.birthDate ?? '-',
  email: data.email ?? '-',
  nameEng: data.nameEng ?? '-',
  nickname: data.nickname ?? '-',
  phone: data.phone ?? '-',
  userId: data.userId ?? 0,
})
