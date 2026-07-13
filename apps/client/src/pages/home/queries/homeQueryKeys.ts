export const homeQueryKeys = {
  all: ['home'] as const,
  hotSnsRestaurants: () => [...homeQueryKeys.all, 'hotSnsRestaurants'] as const,
}
