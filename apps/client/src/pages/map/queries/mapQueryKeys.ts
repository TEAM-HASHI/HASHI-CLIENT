import type { MapPageRequest } from '@/pages/map/api/mapApiTypes'

export const mapQueryKeys = {
  all: ['map'] as const,
  regions: () => [...mapQueryKeys.all, 'regions'] as const,
  lists: () => [...mapQueryKeys.all, 'list'] as const,
  list: (request: MapPageRequest) =>
    [...mapQueryKeys.lists(), request] as const,
  infiniteLists: () => [...mapQueryKeys.all, 'infiniteList'] as const,
  infiniteList: (request: MapPageRequest | null, version: number) =>
    [...mapQueryKeys.infiniteLists(), request, version] as const,
  locations: () => [...mapQueryKeys.all, 'location'] as const,
  location: (id: string) => [...mapQueryKeys.locations(), id] as const,
}
