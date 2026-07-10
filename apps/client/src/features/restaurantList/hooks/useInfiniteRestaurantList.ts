import { useEffect, useRef, useState } from 'react'

type UseInfiniteRestaurantListParams<TItem> = {
  items: TItem[]
  pageSize: number
}

export const useInfiniteRestaurantList = <TItem>({
  items,
  pageSize,
}: UseInfiniteRestaurantListParams<TItem>) => {
  const loadMoreRef = useRef<HTMLLIElement | null>(null)
  const [visibleItemCount, setVisibleItemCount] = useState(pageSize)

  const visibleItems = items.slice(0, visibleItemCount)
  const hasMoreItems = visibleItemCount < items.length

  useEffect(() => {
    if (!hasMoreItems || typeof IntersectionObserver === 'undefined') {
      return
    }

    const target = loadMoreRef.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setVisibleItemCount((currentCount) =>
          Math.min(currentCount + pageSize, items.length),
        )
      },
      {
        root: null,
        rootMargin: '120px 0px',
        threshold: 0,
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasMoreItems, items.length, pageSize, visibleItemCount])

  return {
    hasMoreItems,
    loadMoreRef,
    visibleItems,
  }
}
