import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { adminQueryKeys } from '@/shared/api/queryKeys'
import {
  reservationApi,
  type ChangeReservationStatusBody,
  type ListReservationsQuery,
} from '@/shared/api/reservationApi'
import {
  toReservationListView,
  toReservationUserView,
} from '@/shared/api/reservationViewModel'

export const useReservationsQuery = (params: ListReservationsQuery) =>
  useQuery({
    placeholderData: keepPreviousData,
    queryFn: async () =>
      toReservationListView(await reservationApi.listReservations(params)),
    queryKey: adminQueryKeys.reservations.list(params),
  })

export const useReservationUserQuery = (reservationId: number | null) =>
  useQuery({
    enabled: reservationId != null,
    queryFn: async () =>
      toReservationUserView(
        await reservationApi.getReservationUser(reservationId ?? 0),
      ),
    queryKey: adminQueryKeys.reservations.user(reservationId ?? 0),
  })

export const useUpdateReservationStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reservationId,
      status,
    }: {
      reservationId: number
      status: ChangeReservationStatusBody['status']
    }) => reservationApi.updateReservationStatus(reservationId, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.reservations.lists(),
      })
    },
  })
}
