import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSearchListRestoration } from '@/pages/search/hooks/useSearchListRestoration'

const { location, navigation } = vi.hoisted(() => ({
  location: { key: 'result-a', search: '?keyword=ramen' },
  navigation: { value: 'POP' },
}))
vi.mock('react-router-dom', () => ({
  useLocation: () => location,
  useNavigationType: () => navigation.value,
}))

const storageKey = 'search-list:result-a:?keyword=ramen'
const fetchNextPage = vi.fn().mockResolvedValue(undefined)
const options = {
  enabled: true,
  pageCount: 1,
  hasNextPage: true,
  isFetching: false,
  isError: false,
  fetchNextPage,
}
let frames: Map<number, FrameRequestCallback>
const flushFrames = () =>
  act(() => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach((callback) => callback(0))
  })

beforeEach(() => {
  sessionStorage.clear()
  frames = new Map()
  let id = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('scrollY', 0)
  vi.stubGlobal(
    'scrollTo',
    vi.fn((options: ScrollToOptions) => {
      vi.stubGlobal('scrollY', options.top ?? 0)
    }),
  )
  location.key = 'result-a'
  location.search = '?keyword=ramen'
  navigation.value = 'POP'
  fetchNextPage.mockClear()
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useSearchListRestoration', () => {
  it('saves the loaded page count and last scroll position on departure', () => {
    const { rerender, unmount } = renderHook(
      (props) => useSearchListRestoration(props),
      { initialProps: options },
    )
    vi.stubGlobal('scrollY', 900)
    act(() => window.dispatchEvent(new Event('scroll')))
    rerender({ ...options, pageCount: 3 })
    unmount()
    expect(JSON.parse(sessionStorage.getItem(storageKey)!)).toEqual({
      pageCount: 3,
      scrollY: 900,
    })
  })

  it('restores cached results without fetching another page', () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ pageCount: 3, scrollY: 900 }),
    )
    const { result } = renderHook(() =>
      useSearchListRestoration({ ...options, pageCount: 3 }),
    )
    expect(result.current).toBe(true)
    flushFrames()
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 900,
      behavior: 'instant',
    })
    expect(fetchNextPage).not.toHaveBeenCalled()
    expect(result.current).toBe(false)
  })

  it('reloads missing pages before restoring after cache expiry', () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ pageCount: 3, scrollY: 900 }),
    )
    const { rerender } = renderHook(
      (props) => useSearchListRestoration(props),
      { initialProps: options },
    )
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).not.toHaveBeenCalled()
    rerender({ ...options, pageCount: 2 })
    expect(fetchNextPage).toHaveBeenCalledTimes(2)
    rerender({ ...options, pageCount: 3 })
    flushFrames()
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 900,
      behavior: 'instant',
    })
  })

  it('preserves the target through errors and waits for explicit retry', () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ pageCount: 2, scrollY: 900 }),
    )
    const { unmount } = renderHook(() =>
      useSearchListRestoration({ ...options, isError: true }),
    )
    flushFrames()
    expect(fetchNextPage).not.toHaveBeenCalled()
    expect(window.scrollTo).not.toHaveBeenCalled()
    unmount()
    expect(JSON.parse(sessionStorage.getItem(storageKey)!)).toEqual({
      pageCount: 2,
      scrollY: 900,
    })
  })

  it('resets new search conditions without overwriting the previous entry', () => {
    const { rerender, unmount } = renderHook(() =>
      useSearchListRestoration(options),
    )
    vi.stubGlobal('scrollY', 900)
    act(() => window.dispatchEvent(new Event('scroll')))
    location.key = 'result-b'
    location.search = '?keyword=sushi'
    navigation.value = 'REPLACE'
    rerender()
    expect(JSON.parse(sessionStorage.getItem(storageKey)!)).toEqual({
      pageCount: 1,
      scrollY: 900,
    })
    expect(window.scrollY).toBe(0)
    unmount()
    expect(
      JSON.parse(
        sessionStorage.getItem('search-list:result-b:?keyword=sushi')!,
      ),
    ).toEqual({ pageCount: 1, scrollY: 0 })
  })

  it('does not restore stale positions for a new navigation', () => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ pageCount: 3, scrollY: 900 }),
    )
    navigation.value = 'PUSH'
    renderHook(() => useSearchListRestoration(options))
    flushFrames()
    expect(window.scrollY).toBe(0)
    expect(fetchNextPage).not.toHaveBeenCalled()
  })

  it('ignores malformed snapshots and does not affect idle/map search', () => {
    sessionStorage.setItem(storageKey, '{invalid')
    const { result } = renderHook(() =>
      useSearchListRestoration({ ...options, enabled: false }),
    )
    expect(result.current).toBe(false)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
