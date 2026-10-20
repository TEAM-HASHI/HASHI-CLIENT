import type { MagazineCatalogParams } from '@/pages/magazines/api/magazineCatalogApi'

const all = ['admin', 'magazine-catalog'] as const

export const magazineQueryKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  detail: (id: number) => [...all, 'detail', id] as const,
  list: (params: MagazineCatalogParams) => [...all, 'list', params] as const,
}
