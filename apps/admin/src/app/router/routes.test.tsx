import { describe, expect, it } from 'vitest'
import { appRoutes } from '@/app/router/routes'
import { ROUTES } from '@/app/router/path'

interface RouteNode {
  path?: string
  children?: RouteNode[]
}

const collectPaths = (routes: RouteNode[]): string[] =>
  routes.flatMap((route) => [
    ...(route.path ? [route.path] : []),
    ...collectPaths(route.children ?? []),
  ])

describe('admin routes', () => {
  it('registers the protected member list route', () => {
    expect(collectPaths(appRoutes as RouteNode[])).toContain(ROUTES.users)
  })
})
