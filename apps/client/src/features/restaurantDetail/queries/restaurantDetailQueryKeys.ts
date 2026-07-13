export const restaurantDetailQueryKeys = {
  all: ['restaurants'] as const,
  details: () => [...restaurantDetailQueryKeys.all, 'detail'] as const,
  detail: (restaurantId: number) =>
    [...restaurantDetailQueryKeys.details(), restaurantId] as const,
  main: (restaurantId: number) =>
    [...restaurantDetailQueryKeys.detail(restaurantId), 'main'] as const,
  storeInformation: (restaurantId: number) =>
    [
      ...restaurantDetailQueryKeys.detail(restaurantId),
      'storeInformation',
    ] as const,
}
