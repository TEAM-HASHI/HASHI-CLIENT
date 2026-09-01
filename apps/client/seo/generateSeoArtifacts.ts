import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import {
  createHomeSeoPage,
  createMagazineListSeoPage,
  createMenuDetailSeoPage,
  createNoindexSeoPage,
  createNotFoundSeoPage,
  createRestaurantDetailSeoPage,
  createRestaurantListSeoPage,
} from '../src/shared/seo/pageBuilders'
import { mergeSeoMagazines } from '../src/shared/seo/mergeSeoMagazines'
import type { SeoPage } from '../src/shared/seo/types'
import { collectSeoInventory } from './collectSeoInventory'
import { renderSeoDocument } from './renderSeoDocument'
import { renderSitemap } from './renderSitemap'
import { createSeoApiClient } from './seoApiClient'

interface GenerateSeoArtifactsParams {
  apiBaseUrl: string
  fetchImpl?: typeof fetch
  outputDir: string
}

interface PageArtifact {
  file: string
  page: SeoPage
}

const getOutputFile = (outputDir: string, page: SeoPage) => {
  const pathname = new URL(page.canonical).pathname

  if (pathname === '/') {
    return join(outputDir, 'index.html')
  }

  return join(outputDir, pathname.replace(/^\/+/, ''), 'index.html')
}

const writeUtf8 = async (file: string, value: string) => {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, value, 'utf8')
}

const assertOwnedMetadata = (html: string, file: string) => {
  const requiredPatterns = [
    /<title>/g,
    /name="description"/g,
    /name="robots"/g,
    /rel="canonical"/g,
  ]

  requiredPatterns.forEach((pattern) => {
    if ((html.match(pattern) ?? []).length !== 1) {
      throw new Error(
        `${file}에 SEO metadata가 정확히 하나씩 존재하지 않습니다.`,
      )
    }
  })
}

export const generateSeoArtifacts = async ({
  apiBaseUrl,
  fetchImpl,
  outputDir,
}: GenerateSeoArtifactsParams) => {
  const templateFile = join(outputDir, 'index.html')
  const template = await readFile(templateFile, 'utf8')
  const api = createSeoApiClient({ baseUrl: apiBaseUrl, fetchImpl })
  const inventory = await collectSeoInventory(api)
  const magazineSnapshot = mergeSeoMagazines(
    inventory.banners,
    inventory.magazines,
  ).slice(0, 10)
  const indexablePages: SeoPage[] = [
    createHomeSeoPage({
      magazines: inventory.banners,
      restaurants: inventory.homeRestaurants,
    }),
    createRestaurantListSeoPage({
      restaurants: inventory.hashiPick,
      type: 'hashi-pick',
    }),
    createRestaurantListSeoPage({
      restaurants: inventory.popular,
      type: 'popular',
    }),
    createMagazineListSeoPage({ magazines: magazineSnapshot }),
  ]

  for (const { restaurant } of inventory.restaurants) {
    const visibleMenus = restaurant.menus.slice(0, 10)
    indexablePages.push(
      createRestaurantDetailSeoPage({
        ...restaurant,
        menus: visibleMenus,
      }),
    )

    for (const menu of restaurant.menus) {
      indexablePages.push(
        createMenuDetailSeoPage({
          menu,
          otherMenus: restaurant.menus
            .filter((otherMenu) => otherMenu.id !== menu.id)
            .slice(0, 10),
          restaurant,
        }),
      )
    }
  }

  const artifacts: PageArtifact[] = indexablePages.map((page) => ({
    file: getOutputFile(outputDir, page),
    page,
  }))
  const shellArtifacts: PageArtifact[] = [
    {
      file: join(outputDir, 'public-noindex-shell.html'),
      page: createNoindexSeoPage({
        description: '검색 및 탐색 결과는 서비스 안에서 확인할 수 있습니다.',
        pathname: '/search',
        robots: 'noindex, follow',
        title: 'HASHI 탐색',
      }),
    },
    {
      file: join(outputDir, 'private-noindex-shell.html'),
      page: createNoindexSeoPage({
        description: '로그인 후 이용할 수 있는 HASHI 사용자 페이지입니다.',
        pathname: '/mypage',
        robots: 'noindex, nofollow',
        title: 'HASHI 사용자 페이지',
      }),
    },
    {
      file: join(outputDir, '404.html'),
      page: createNotFoundSeoPage('/404'),
    },
  ]

  for (const { file, page } of [...artifacts, ...shellArtifacts]) {
    const html = renderSeoDocument(template, page)
    assertOwnedMetadata(html, file)
    await writeUtf8(file, html)
  }

  const sitemap = renderSitemap(indexablePages)
  await writeUtf8(join(outputDir, 'sitemap.xml'), sitemap)
  await writeUtf8(
    join(outputDir, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: https://www.hashi.kr/sitemap.xml\n',
  )

  for (const { file } of artifacts) {
    await readFile(file, 'utf8')
  }

  const menuCount = inventory.restaurants.reduce(
    (count, { restaurant }) => count + restaurant.menus.length,
    0,
  )

  return {
    magazines: inventory.magazines.length,
    menus: menuCount,
    restaurants: inventory.restaurants.length,
    urls: indexablePages.length,
  }
}
