import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface PublicRouteManifest {
  version: 1
  restaurantIds: number[]
  paths: string[]
}

const checkIsPublicRouteManifest = (
  value: unknown,
): value is PublicRouteManifest => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const manifest = value as Partial<PublicRouteManifest>

  return (
    manifest.version === 1 &&
    Array.isArray(manifest.restaurantIds) &&
    manifest.restaurantIds.every(
      (restaurantId) => Number.isSafeInteger(restaurantId) && restaurantId > 0,
    ) &&
    Array.isArray(manifest.paths) &&
    manifest.paths.every(
      (path) => typeof path === 'string' && path.startsWith('/'),
    ) &&
    new Set(manifest.paths).size === manifest.paths.length
  )
}

export const readPublicRouteManifest = async () => {
  const manifestPath = resolve(process.cwd(), '.seo/public-route-manifest.json')
  const source = await readFile(manifestPath, 'utf8')
  const manifest: unknown = JSON.parse(source)

  if (!checkIsPublicRouteManifest(manifest)) {
    throw new Error('공개 경로 manifest 형식이 올바르지 않습니다.')
  }

  return manifest
}
