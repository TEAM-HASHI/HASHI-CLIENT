# Infinite Query

Use infinite queries for cursor/page based list loading. Do not reuse finite list keys.

## Cursor Example

```ts
export const restaurantInfiniteQueryOptions = (params: RestaurantListParams) =>
  infiniteQueryOptions({
    queryKey: restaurantQueryKeys.infiniteList(params),
    queryFn: ({ pageParam }) =>
      getRestaurants({ ...params, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
```

## Rules

- Confirm cursor vs page pagination from the API spec before coding.
- `initialPageParam` is required.
- `getNextPageParam` must use documented response fields.
- Flatten `data.pages` in a named derived value.
- Separate initial loading from `isFetchingNextPage`.
- Trigger `fetchNextPage` from IntersectionObserver or an explicit more button.
- Disable next-page fetch when `!hasNextPage` or already fetching.
- Include filters and sort in the query key, not pageParam.

## Suspense Infinite

Use `useSuspenseInfiniteQuery` only when the first page is required for initial page render.
Use `useInfiniteQuery` for search, filters, tabs, placeholder behavior, or local list-only loading.
