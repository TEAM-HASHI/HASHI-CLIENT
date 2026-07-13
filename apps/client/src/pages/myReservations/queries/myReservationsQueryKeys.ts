import type { MyReservationsApiStatus } from '@/pages/myReservations/api/getMyReservations'

export const myReservationsQueryKeys = {
  all: ['myReservations'] as const,
  disabled: () => [...myReservationsQueryKeys.all, 'disabled'] as const,
  infiniteList: (status: MyReservationsApiStatus) =>
    [...myReservationsQueryKeys.all, 'infiniteList', status] as const,
}
