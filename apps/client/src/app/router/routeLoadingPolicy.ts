export const ROUTE_LOADING_DELAY_MS = 150
const ROUTE_LOADING_MIN_VISIBLE_MS = 300

let wasRouteLoadingFallbackShown = false

export const resetRouteLoadingFallbackShown = () => {
  wasRouteLoadingFallbackShown = false
}

export const markRouteLoadingFallbackShown = () => {
  wasRouteLoadingFallbackShown = true
}

const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const applyRouteLoadingTiming = async <T>(modulePromise: Promise<T>) => {
  const startedAt = Date.now()
  const module = await modulePromise
  const elapsedMs = Date.now() - startedAt
  const minimumPendingMs = ROUTE_LOADING_DELAY_MS + ROUTE_LOADING_MIN_VISIBLE_MS

  if (
    wasRouteLoadingFallbackShown &&
    elapsedMs >= ROUTE_LOADING_DELAY_MS &&
    elapsedMs < minimumPendingMs
  ) {
    await wait(minimumPendingMs - elapsedMs)
  }

  return module
}
