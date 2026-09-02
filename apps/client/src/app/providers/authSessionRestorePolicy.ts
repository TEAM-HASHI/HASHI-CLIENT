import { ROUTES } from '@/app/router/path'

// 로그인 없이 접근 가능한 public route 전체가 아니라, auth restore 완료 전에도
// 먼저 렌더링해도 잘못된 인증 상태 UI가 노출될 위험이 낮은 route만 포함한다.
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
