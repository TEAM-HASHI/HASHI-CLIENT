import { ROUTES } from '@/app/router/path'

const AUTH_RESTORE_NON_BLOCKING_PATHS = new Set<string>([
  ROUTES.hashiPickRestaurants,
  ROUTES.popularRestaurants,
])

export const getShouldRenderDuringAuthRestore = (
  pathname: string | undefined,
) => {
  if (!pathname) {
    return false
  }

  return AUTH_RESTORE_NON_BLOCKING_PATHS.has(pathname)
}
