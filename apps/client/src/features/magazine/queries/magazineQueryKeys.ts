export const magazineQueryKeys = {
  all: ['magazine'] as const,
  banners: () => [...magazineQueryKeys.all, 'banners'] as const,
  detail: (magazineId: number, viewer: number) =>
    [...magazineQueryKeys.all, 'detail', magazineId, viewer] as const,
}
