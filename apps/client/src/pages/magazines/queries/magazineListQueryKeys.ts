export type MagazineListQueryParams = {
  size: number
}

export const magazineListQueryKeys = {
  all: ['magazines'] as const,
  infiniteLists: () => [...magazineListQueryKeys.all, 'infiniteList'] as const,
  infiniteList: (params: MagazineListQueryParams) =>
    [...magazineListQueryKeys.infiniteLists(), params] as const,
}
