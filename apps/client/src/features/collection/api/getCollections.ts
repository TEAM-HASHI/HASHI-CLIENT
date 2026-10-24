import type {
  CollectionListData,
  CollectionsParamsTypes,
} from '@/features/collection/api/collectionApiTypes'
import { validateCollectionList } from '@/features/collection/api/collectionReadContracts'
import { request } from '@/shared/api/request'

export const getCollections = async (
  params: CollectionsParamsTypes = {},
  signal?: AbortSignal,
) => {
  const data = await request<CollectionListData>('/api/v1/collections', {
    method: 'get',
    cache: 'no-store',
    searchParams: params,
    signal,
  })
  return validateCollectionList(data, params.cursor)
}
