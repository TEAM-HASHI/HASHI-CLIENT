import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  applyRouteLoadingTiming,
  markRouteLoadingFallbackShown,
  resetRouteLoadingFallbackShown,
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
})
