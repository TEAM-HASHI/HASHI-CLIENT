import type { ListReservationsQuery } from '@/shared/api/reservationApi'

const all = ['admin'] as const
const reservations = [...all, 'reservations'] as const

export const adminQueryKeys = {
  all,
  reservations: {
    all: reservations,
    lists: () => [...reservations, 'list'] as const,
    list: (params: ListReservationsQuery) =>
      [...reservations, 'list', params] as const,
    users: () => [...reservations, 'user'] as const,
    user: (reservationId: number) =>
      [...reservations, 'user', reservationId] as const,
  },
}
