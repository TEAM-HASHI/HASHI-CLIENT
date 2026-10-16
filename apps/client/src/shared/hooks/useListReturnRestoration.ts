import { useLayoutEffect, useRef } from 'react'

type ListReturnSnapshot<T> = {
  locationKey: string
  scrollTop: number
  data: T
}

export const createListReturnStore = <T>() => {
  let pending: ListReturnSnapshot<T> | null = null

  return {
    read: (locationKey: string) =>
      pending?.locationKey === locationKey ? pending : null,
    save: (snapshot: ListReturnSnapshot<T>) => {
      pending = snapshot
    },
    consume: (locationKey: string) => {
      if (pending?.locationKey !== locationKey) {
        return null
      }

      const snapshot = pending
      pending = null
      return snapshot
    },
  }
}

type UseListReturnRestorationParams<T> = {
  locationKey: string
  ready: boolean
  store: ReturnType<typeof createListReturnStore<T>>
}

export const useListReturnRestoration = <T>({
  locationKey,
  ready,
  store,
}: UseListReturnRestorationParams<T>) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ready || !scrollRef.current) {
      return
    }

    const snapshot = store.consume(locationKey)
    if (snapshot) {
      scrollRef.current.scrollTop = snapshot.scrollTop
    }
  }, [locationKey, ready, store])

  const capture = (data: T) => {
    store.save({
      locationKey,
      scrollTop: scrollRef.current?.scrollTop ?? 0,
      data,
    })
  }

  const reset = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }

  return { scrollRef, capture, reset }
}
