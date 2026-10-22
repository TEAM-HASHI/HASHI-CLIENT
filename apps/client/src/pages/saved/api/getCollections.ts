import type {
  CollectionListData,
  CollectionsParamsTypes,
} from '@/pages/saved/api/collectionApiTypes'
import { validateCollectionList } from '@/pages/saved/api/collectionReadContracts'
import { request } from '@/shared/api/request'

export const getCollections = async (
  params: CollectionsParamsTypes = {},
  signal?: AbortSignal,
) => {
  const data = await request<CollectionListData>('/api/v1/collections', {
    method: 'get',
    searchParams: params,
    signal,
  })
  return validateCollectionList(data, params.cursor)
}
