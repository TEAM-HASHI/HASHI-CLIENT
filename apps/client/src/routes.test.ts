import type { RouteConfigEntry } from '@react-router/dev/routes'
import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/router/path'
import routes from '@/routes'

const joinRoutePath = (parentPath: string, routePath?: string) => {
  if (routePath === undefined) {
    return parentPath
  }

  const normalizedParentPath = parentPath.replace(/\/$/, '')
  const normalizedRoutePath = routePath.replace(/^\//, '')

  return `${normalizedParentPath}/${normalizedRoutePath}`
}

const collectRoutePaths = (
  routeEntries: RouteConfigEntry[],
  parentPath = '',
): string[] => {
  return routeEntries.flatMap((routeEntry) => {
    const routePath = routeEntry.index
      ? parentPath || '/'
      : joinRoutePath(parentPath, routeEntry.path)
    const ownPath =
      routeEntry.path === undefined && !routeEntry.index ? [] : [routePath]

    return [
      ...ownPath,
      ...collectRoutePaths(routeEntry.children ?? [], routePath),
    ]
  })
}

describe('Framework Mode route config', () => {
  it('preserves every existing application route', () => {
    const routePaths = collectRoutePaths(routes)

    expect(routePaths).toEqual(
      expect.arrayContaining([...Object.values(ROUTES), '/*']),
    )
  })
})
