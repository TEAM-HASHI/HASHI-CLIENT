import { useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
import { locationKeys } from '@/features/restaurantLocation/queries/locationQueries'
import {
  restaurantApi,
  type CreateRestaurantBody,
  type UpdateRestaurantBody,
} from '@/shared/api/restaurantApi'

const useInvalidateRestaurantLists = () => {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.lists() })
}

export const useCreateRestaurantMutation = () => {
  const invalidate = useInvalidateRestaurantLists()
  return useMutation({
    mutationFn: (input: CreateRestaurantBody) =>
      restaurantApi.createRestaurant(input),
    onSuccess: invalidate,
  })
}

export const useUpdateRestaurantMutation = () => {
  const invalidate = useInvalidateRestaurantLists()
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({
      restaurantId,
      input,
    }: {
      restaurantId: number
      input: UpdateRestaurantBody
    }) => restaurantApi.updateRestaurant(restaurantId, input),
    onSuccess: async (_result, { restaurantId }) => {
      const prefillKey = [...restaurantQueryKeys.prefills(), restaurantId]
      await client.cancelQueries({ queryKey: prefillKey })
      void client.invalidateQueries({
        queryKey: prefillKey,
        refetchType: 'none',
      })
      void client.invalidateQueries({
        queryKey: locationKeys.status(restaurantId),
        exact: true,
      })
      void client.invalidateQueries({ queryKey: locationKeys.lists })
      return invalidate()
    },
  })
}

export const useDeleteRestaurantMutation = () => {
  const invalidate = useInvalidateRestaurantLists()
  const client = useQueryClient()
  return useMutation({
    mutationFn: restaurantApi.deleteRestaurant,
    onSuccess: (_result, restaurantId) => {
      client.removeQueries({
        queryKey: locationKeys.status(restaurantId),
        exact: true,
      })
      void client.invalidateQueries({ queryKey: locationKeys.lists })
      return invalidate()
    },
  })
}
