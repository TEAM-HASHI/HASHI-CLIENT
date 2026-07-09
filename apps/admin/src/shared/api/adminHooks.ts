import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminQueryKeys } from '@/shared/api/queryKeys'
import { adminService } from '@/shared/api/adminService'
import type {
  AdminReservationStatus,
  MagazineFormData,
  MockScenario,
  RestaurantFormData,
} from '@/shared/api/adminTypes'

export const useDashboardMetricsQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: adminService.getDashboardMetrics,
  })

export const useRestaurantsQuery = (scenario: MockScenario) =>
  useQuery({
    queryKey: [...adminQueryKeys.restaurants, scenario],
    queryFn: () => adminService.listRestaurants(scenario),
  })

export const useCreateRestaurantMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.createRestaurant,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.restaurants,
      })
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.dashboard,
      })
    },
  })
}

export const useUpdateRestaurantMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restaurantId,
      input,
    }: {
      restaurantId: string
      input: RestaurantFormData
    }) => adminService.updateRestaurant(restaurantId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.restaurants,
      })
    },
  })
}

export const useDeleteRestaurantMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.deleteRestaurant,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.restaurants,
      })
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.dashboard,
      })
    },
  })
}

export const useReservationsQuery = (scenario: MockScenario) =>
  useQuery({
    queryKey: [...adminQueryKeys.reservations, scenario],
    queryFn: () => adminService.listReservations(scenario),
  })

export const useUpdateReservationStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reservationId,
      status,
    }: {
      reservationId: string
      status: AdminReservationStatus
    }) => adminService.updateReservationStatus(reservationId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.reservations,
      })
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.dashboard,
      })
    },
  })
}

export const useReservationUserQuery = (
  reservationId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: adminQueryKeys.reservationUser(reservationId ?? 'none'),
    queryFn: () => adminService.getReservationUser(reservationId ?? ''),
    enabled: enabled && reservationId != null,
  })

export const useMagazinesQuery = (scenario: MockScenario) =>
  useQuery({
    queryKey: [...adminQueryKeys.magazines, scenario],
    queryFn: () => adminService.listMagazines(scenario),
  })

export const useCreateMagazineMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.createMagazine,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.magazines,
      })
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.dashboard,
      })
    },
  })
}

export const useUpdateMagazineMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      magazineId,
      input,
    }: {
      magazineId: string
      input: MagazineFormData
    }) => adminService.updateMagazine(magazineId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.magazines,
      })
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.dashboard,
      })
    },
  })
}

export const useDeleteMagazineMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminService.deleteMagazine,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.magazines,
      })
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.dashboard,
      })
    },
  })
}
