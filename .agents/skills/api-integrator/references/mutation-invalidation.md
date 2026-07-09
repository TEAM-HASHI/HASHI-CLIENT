# Mutation And Invalidation

Use mutations for server writes and make cache effects explicit.

## Shape

```ts
export const cancelReservationMutationOptions = () =>
  mutationOptions({
    mutationKey: ['cancelReservation'] as const,
    mutationFn: cancelReservation,
  })

export const useCancelReservationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    ...cancelReservationMutationOptions(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: reservationQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: reservationQueryKeys.detail(variables.reservationId),
        }),
      ])
    },
  })
}
```

## Rules

- Mutation endpoint functions must not import TanStack Query.
- Mutation hooks own invalidation because they have access to `queryClient` and UI-side side effects.
- Use query key factory outputs for invalidation.
- Await invalidation when the UI should not treat the mutation as complete before refetch starts.
- Do not add optimistic updates unless the API spec or product requirement asks for it.
- Field-level error mapping must be driven by documented error codes or response fields.
