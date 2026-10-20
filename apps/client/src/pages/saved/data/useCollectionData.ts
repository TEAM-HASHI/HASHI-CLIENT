import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CollectionData } from '@/pages/saved/types'

export const CollectionDataContext = createContext<{
  data: CollectionData
  setData: Dispatch<SetStateAction<CollectionData>>
} | null>(null)

export const useCollectionData = () => {
  const context = useContext(CollectionDataContext)
  if (!context) throw new Error('CollectionDataProvider is required')
  return context
}
