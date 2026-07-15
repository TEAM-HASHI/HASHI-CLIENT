import { readPublicRouteManifest } from '@/shared/seo/publicRouteManifest.server'
import { createSitemapXml } from '@/shared/seo/searchResources'

export const loader = async () => {
  const manifest = await readPublicRouteManifest()

  return new Response(createSitemapXml(manifest.paths), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
