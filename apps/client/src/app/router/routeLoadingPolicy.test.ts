import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  applyRouteLoadingTiming,
  loadRouteChunk,
  markRouteLoadingFallbackShown,
  resetRouteLoadingFallbackShown,
  RouteChunkLoadError,
} from '@/app/router/routeLoadingPolicy'

const routeModule = { default: () => null }

describe('route loading policy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    resetRouteLoadingFallbackShown()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves immediately when the loading fallback was not shown', async () => {
    await expect(
      applyRouteLoadingTiming(Promise.resolve(routeModule)),
    ).resolves.toBe(routeModule)
  })

  it('keeps a shown loading fallback visible for at least 300ms', async () => {
    const modulePromise = new Promise<typeof routeModule>((resolve) => {
      setTimeout(() => resolve(routeModule), 200)
    })
    const timedModulePromise = applyRouteLoadingTiming(modulePromise)
    let isResolved = false
    void timedModulePromise.then(() => {
      isResolved = true
    })

    await vi.advanceTimersByTimeAsync(150)
    markRouteLoadingFallbackShown()

    await vi.advanceTimersByTimeAsync(299)
    expect(isResolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await expect(timedModulePromise).resolves.toBe(routeModule)
  })

  it('converts a rejected route import into a route chunk load error', async () => {
    const importError = new TypeError(
      'Failed to fetch dynamically imported module',
    )
    let caughtError: unknown

    try {
      await loadRouteChunk(() => Promise.reject(importError))
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).toBeInstanceOf(RouteChunkLoadError)
    expect(caughtError).toMatchObject({
      cause: importError,
      name: 'RouteChunkLoadError',
    })
  })
})
