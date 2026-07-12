import { useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
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
  return useMutation({
    mutationFn: ({
      restaurantId,
      input,
    }: {
      restaurantId: number
      input: UpdateRestaurantBody
    }) => restaurantApi.updateRestaurant(restaurantId, input),
    onSuccess: invalidate,
  })
}

export const useDeleteRestaurantMutation = () => {
  const invalidate = useInvalidateRestaurantLists()
  return useMutation({
    mutationFn: restaurantApi.deleteRestaurant,
    onSuccess: invalidate,
  })
}
