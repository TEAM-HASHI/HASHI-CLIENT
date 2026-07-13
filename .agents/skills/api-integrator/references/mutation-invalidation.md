# Mutation Cache Synchronization

Use mutations for server writes and make cache effects explicit.

## Decision Table

| Mutation result and UI flow                                       | Cache operation                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| Complete latest entity is returned and must appear immediately    | `setQueryData` for the exact detail key                      |
| Save succeeds and the UI moves to a list or another screen        | `invalidateQueries` for the data read by the destination     |
| Create/delete changes list order, membership, count, or aggregate | `invalidateQueries` for the affected prefixes                |
| Response is partial or server-derived fields are unknown          | `invalidateQueries` instead of constructing a guessed entity |
| Complete detail is returned but lists/counts also change          | `setQueryData` for detail and invalidate list/count prefixes |

Route changes do not clear TanStack Query cache. A remounted query refetches because invalidation marked it stale, not merely because the component mounted again.

## Mixed Shape

```ts
export const useUpdateRestaurantMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRestaurant,
    onSuccess: async (restaurant) => {
      queryClient.setQueryData(
        restaurantQueryKeys.detail(restaurant.restaurantId),
        restaurant,
      )

      await queryClient.invalidateQueries({
        queryKey: restaurantQueryKeys.lists(),
      })
    },
  })
}
```

## Rules

- Mutation endpoint functions must not import TanStack Query.
- Mutation hooks own cache synchronization because they have access to `queryClient` and UI-side side effects.
- Use query key factory outputs for `setQueryData`, invalidation, and other cache access.
- Use `setQueryData` only when the mutation returns the complete latest object for that exact key. It updates cache synchronously without a network request.
- Prefer invalidation when navigating after save, when the response is partial, or when list order, membership, count, aggregates, or other server-derived values may change.
- Combine detail `setQueryData` with list/count invalidation when both conditions apply.
- `setQueryData` targets one exact key. When invalidating only a detail key that is also a prefix for child keys, pass `exact: true`. Omit `exact` or invalidate explicit child prefixes when the mutation also makes child data stale.
- Await invalidation when the UI should not treat the mutation as complete before refetch starts.
- Do not create speculative query keys or cache writes for data that has no query owner yet.
- Do not use `resetQueries` or `removeQueries` for ordinary mutation success handling.
- Do not add optimistic updates unless the API spec or product requirement asks for it.
- Field-level error mapping must be driven by documented error codes or response fields.
