import type { MagazineCatalogParams } from '@/pages/magazines/api/magazineCatalogApi'

const all = ['admin', 'magazine-catalog'] as const

export const magazineQueryKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params: MagazineCatalogParams) => [...all, 'list', params] as const,
}
