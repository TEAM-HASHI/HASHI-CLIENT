# Query Options

Use TanStack Query option helpers to keep type inference and reuse.

## Suspense Detail Query

```ts
export const restaurantDetailQueryOptions = (restaurantId: string) =>
  queryOptions({
    queryKey: restaurantQueryKeys.detail(restaurantId),
    queryFn: () => getRestaurantDetail(restaurantId),
  })

export const useRestaurantDetailQuery = (restaurantId: string) => {
  return useSuspenseQuery(restaurantDetailQueryOptions(restaurantId))
}
```

## Conditional Query

```ts
export const restaurantListQueryOptions = (params: RestaurantListParams) =>
  queryOptions({
    queryKey: restaurantQueryKeys.list(params),
    queryFn: () => getRestaurants(params),
  })

export const useRestaurantListQuery = (params: RestaurantListParams) => {
  return useQuery({
    ...restaurantListQueryOptions(params),
    enabled: (params.keyword ?? '').trim().length > 0,
  })
}
```

## Rules

- Put `queryOptions` in `queries/`.
- Put React hooks in `hooks/`.
- Keep data transforms pure and testable when they are non-trivial.
- Do not hide navigation, toast, or mutation side effects inside query functions.
