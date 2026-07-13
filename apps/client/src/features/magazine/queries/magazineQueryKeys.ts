export const magazineQueryKeys = {
  all: ['magazine'] as const,
  banners: () => [...magazineQueryKeys.all, 'banners'] as const,
}
