import type { SeoPage } from '../src/shared/seo/types'
import {
  escapeHtmlAttribute,
  escapeHtmlText,
  serializeJsonLd,
} from '../src/shared/seo/serializeSeo'

const removeExistingSeoHead = (html: string) =>
  html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(
      /<meta\b(?=[^>]*(?:name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["']))[^>]*>\s*/gi,
      '',
    )
    .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>\s*/gi, '')
    .replace(
      /<script\b(?=[^>]*type=["']application\/ld\+json["'])(?=[^>]*data-hashi-seo)[^>]*>[\s\S]*?<\/script>\s*/gi,
      '',
    )
    .replace(
      /<style\b(?=[^>]*data-hashi-prerender-transition)[^>]*>[\s\S]*?<\/style>\s*/gi,
      '',
    )

const renderPrerenderTransitionStyle =
  () => `<style data-hashi-prerender-transition>
      [data-hashi-prerender-shell] {
        display: grid;
        min-height: 100dvh;
      }
      [data-hashi-prerender-shell] > #root,
      [data-hashi-prerender-shell] > [data-hashi-seo-snapshot] {
        grid-area: 1 / 1;
        min-width: 0;
        min-height: 100dvh;
      }
      [data-hashi-seo-snapshot] {
        width: 100%;
        max-width: 430px;
        margin-inline: auto;
        background: #fff;
      }
    </style>`

const renderMeta = (
  attribute: 'name' | 'property',
  key: string,
  content: string,
) =>
  `<meta ${attribute}="${escapeHtmlAttribute(key)}" content="${escapeHtmlAttribute(content)}" data-hashi-seo />`

const renderHead = (page: SeoPage) => {
  const meta = [
    renderMeta('name', 'description', page.description),
    renderMeta('name', 'robots', page.robots),
    renderMeta('property', 'og:title', page.title),
    renderMeta('property', 'og:description', page.description),
    renderMeta('property', 'og:type', page.type),
    renderMeta('property', 'og:url', page.canonical),
    renderMeta('property', 'og:image', page.image),
    renderMeta('property', 'og:site_name', 'HASHI'),
    renderMeta('property', 'og:locale', 'ko_KR'),
    renderMeta('name', 'twitter:card', 'summary_large_image'),
    renderMeta('name', 'twitter:title', page.title),
    renderMeta('name', 'twitter:description', page.description),
    renderMeta('name', 'twitter:image', page.image),
  ]

  return [
    renderPrerenderTransitionStyle(),
    `<title>${escapeHtmlText(page.title)}</title>`,
    ...meta,
    `<link rel="canonical" href="${escapeHtmlAttribute(page.canonical)}" data-hashi-seo />`,
    ...page.structuredData.map(
      (value) =>
        `<script type="application/ld+json" data-hashi-seo>${serializeJsonLd(value)}</script>`,
    ),
  ].join('\n    ')
}

const renderSnapshot = (page: SeoPage) => {
  const { snapshot } = page
  const renderDimensions = (width?: number, height?: number) =>
    width && height ? ` width="${width}" height="${height}"` : ''
  const image = snapshot.image
    ? `<img src="${escapeHtmlAttribute(snapshot.image)}" alt="${escapeHtmlAttribute(
        snapshot.imageAlt ?? snapshot.heading,
      )}"${renderDimensions(snapshot.imageWidth, snapshot.imageHeight)} decoding="async" fetchpriority="high" />`
    : ''
  const facts = snapshot.facts?.length
    ? `<dl>${snapshot.facts
        .map(
          (fact) =>
            `<div><dt>${escapeHtmlText(fact.label)}</dt><dd>${escapeHtmlText(fact.value)}</dd></div>`,
        )
        .join('')}</dl>`
    : ''
  const links = snapshot.links.length
    ? `<ul>${snapshot.links
        .map(
          (link) =>
            `<li><a href="${escapeHtmlAttribute(link.href)}">${
              link.image
                ? `<img src="${escapeHtmlAttribute(link.image)}" alt="${escapeHtmlAttribute(
                    link.imageAlt ?? link.label,
                  )}"${renderDimensions(link.imageWidth, link.imageHeight)} loading="lazy" decoding="async" />`
                : ''
            }${escapeHtmlText(link.label)}</a></li>`,
        )
        .join('')}</ul>`
    : ''

  return `<main data-hashi-seo-snapshot><h1>${escapeHtmlText(
    snapshot.heading,
  )}</h1><p>${escapeHtmlText(snapshot.summary)}</p>${facts}${image}${links}</main>`
}

export const renderSeoDocument = (template: string, page: SeoPage) => {
  if (
    !/<div\s+id=["']root["']\s*><\/div>/i.test(template) ||
    !/<\/head>/i.test(template)
  ) {
    throw new Error(
      'SEO HTML template에 예상한 root 또는 head marker가 없습니다.',
    )
  }

  const withoutExistingSeo = removeExistingSeoHead(template)
  const withHead = withoutExistingSeo.replace(
    /<\/head>/i,
    `    ${renderHead(page)}\n  </head>`,
  )

  return withHead.replace(
    /<div\s+id=["']root["']\s*><\/div>/i,
    `<div data-hashi-prerender-shell>${renderSnapshot(page)}<div id="root"></div></div>`,
  )
}
