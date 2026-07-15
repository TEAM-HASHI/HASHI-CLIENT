import { createCanonicalUrl } from '@/shared/seo/metadata'

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export const createRobotsText = () =>
  [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${createCanonicalUrl('/sitemap.xml')}`,
    '',
  ].join('\n')

export const createSitemapXml = (paths: string[]) => {
  const urls = paths
    .map(
      (path) =>
        `  <url><loc>${escapeXml(createCanonicalUrl(path))}</loc></url>`,
    )
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}
