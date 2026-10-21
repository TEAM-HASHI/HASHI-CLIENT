import { useMutation, useQueryClient } from '@tanstack/react-query'
import { magazineQueryKeys } from '@/pages/magazines/queries/magazineQueryKeys'
import {
  magazineApi,
  type CreateMagazineBody,
  type UpdateMagazineBody,
} from '@/shared/api/magazineApi'

const useInvalidateMagazineQueries = () => {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: magazineQueryKeys.all })
}

export const useCreateMagazineMutation = () => {
  const invalidate = useInvalidateMagazineQueries()
  return useMutation({
    mutationFn: (input: CreateMagazineBody) =>
      magazineApi.createMagazine(input),
    onSuccess: invalidate,
  })
}

export const useUpdateMagazineMutation = () => {
  const invalidate = useInvalidateMagazineQueries()
  return useMutation({
    mutationFn: ({
      magazineId,
      input,
    }: {
      magazineId: number
      input: UpdateMagazineBody
    }) => magazineApi.updateMagazine(magazineId, input),
    onSuccess: invalidate,
  })
}

export const useDeleteMagazineMutation = () => {
  const invalidate = useInvalidateMagazineQueries()
  return useMutation({
    mutationFn: magazineApi.deleteMagazine,
    onSuccess: invalidate,
  })
}
