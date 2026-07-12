# Query Key Factory

Every API domain must own a query key factory. Do not inline array keys in hooks or invalidation calls.

## Standard Shape

```ts
export const restaurantQueryKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantQueryKeys.all, 'list'] as const,
  list: (params: RestaurantListParams) =>
    [...restaurantQueryKeys.lists(), params] as const,
  infiniteLists: () => [...restaurantQueryKeys.all, 'infiniteList'] as const,
  infiniteList: (params: RestaurantListParams) =>
    [...restaurantQueryKeys.infiniteLists(), params] as const,
  details: () => [...restaurantQueryKeys.all, 'detail'] as const,
  detail: (restaurantId: string) =>
    [...restaurantQueryKeys.details(), restaurantId] as const,
}
```

## Rules

- Include every API input that changes response data.
- Prefer one serializable params object for filters and sort.
- Keep list, infinite list, and detail prefixes separate.
- Use prefix keys intentionally for invalidation.
- Do not put functions, class instances, DOM values, or non-serializable objects in keys.
- When key structure changes, update every `invalidateQueries`, `prefetchQuery`, and direct cache access.

## Naming

- Page-local factory: `{domain}QueryKeys`.
- Feature factory: `{feature}QueryKeys`.
- Export named constants only.
