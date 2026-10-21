import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import type { CollectionData } from '@/pages/saved/types'

import { CollectionDataContext } from '@/pages/saved/data/useCollectionData'

/** 라우트 간에만 유지하는 목 상태. 새로고침 시 초기화하며 영구 저장하지 않는다. */
export const CollectionDataProvider = ({
  children,
  initialData = collectionMocks,
}: PropsWithChildren<{ initialData?: CollectionData }>) => {
  const [data, setData] = useState(initialData)
  return (
    <CollectionDataContext.Provider value={{ data, setData }}>
      {children}
    </CollectionDataContext.Provider>
  )
}
