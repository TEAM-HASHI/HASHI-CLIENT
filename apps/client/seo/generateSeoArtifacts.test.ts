// @vitest-environment node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateSeoArtifacts } from './generateSeoArtifacts'

const temporaryDirectories: string[] = []

const createJsonResponse = (data: unknown) =>
  new Response(JSON.stringify({ data, success: true }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  })

const createFetch = () =>
  vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input))
    const pathname = url.pathname

    if (pathname === '/api/v1/restaurants') {
      return createJsonResponse({
        content: [
          {
            foodCategory: '스시',
            imageUrls: ['https://images.hashi.kr/123.jpg'],
            name: '히마와리 스시',
            restaurantId: 123,
            summary: '도쿄 현지 스시',
          },
        ],
        hasNext: false,
      })
    }

    if (pathname === '/api/v1/restaurants/123/summary') {
      return createJsonResponse({
        address: '도쿄도 주오구',
        foodCategory: '스시',
        imageUrls: ['https://images.hashi.kr/123.jpg'],
        name: '히마와리 스시',
        rating: 4.7,
        reservationFee: 1000,
        restaurantId: 123,
        reviewCount: 20,
        summary: '도쿄 현지 스시',
      })
    }

    if (pathname === '/api/v1/restaurants/123/store-information') {
      return createJsonResponse({
        businessHours: [
          {
            closeTime: '20:00',
            closed: false,
            dayOfWeek: 'MONDAY',
            openTime: '11:00',
          },
        ],
        description: '제철 생선을 제공하는 스시집',
        priceRange: { currency: 'JPY', maxPrice: 5000, minPrice: 3000 },
        restaurantId: 123,
      })
    }

    if (pathname === '/api/v1/restaurants/123/menus') {
      return createJsonResponse({
        content: [
          {
            currency: 'JPY',
            description: '런치 한정 세트',
            menuId: 10,
            name: '스시 런치',
            price: 3000,
          },
        ],
        hasNext: false,
      })
    }

    if (pathname === '/api/v1/magazines') {
      return createJsonResponse({
        hasNext: false,
        magazines: [
          {
            instagramRedirectUrl: 'https://www.instagram.com/p/hashimagazine',
            magazineId: 31,
            thumbnailImageUrl: 'https://images.hashi.kr/magazine.jpg',
            title: '도쿄 미식 여행',
          },
        ],
      })
    }

    if (pathname === '/api/v1/magazines/banners') {
      return createJsonResponse({
        banners: [
          {
            bannerImageUrl: 'https://images.hashi.kr/banner.jpg',
            instagramRedirectUrl:
              'https://www.instagram.com/p/hashi-home-banner',
            magazineId: 32,
            title: '하시 홈 배너',
          },
        ],
      })
    }

    return new Response(null, { status: 404 })
  })

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  )
})

describe('generateSeoArtifacts', () => {
  it('writes complete static documents, crawling files and noindex shells', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'hashi-seo-'))
    temporaryDirectories.push(outputDir)
    await writeFile(
      join(outputDir, 'index.html'),
      '<!doctype html><html><head><meta name="description" content="default"><meta name="robots" content="noindex, nofollow"><title>HASHI</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>',
    )

    const result = await generateSeoArtifacts({
      apiBaseUrl: 'https://api.hashi.test',
      fetchImpl: createFetch() as typeof fetch,
      outputDir,
    })

    const expectedFiles = [
      'index.html',
      'public-noindex-shell.html',
      'private-noindex-shell.html',
      '404.html',
      'robots.txt',
      'sitemap.xml',
      'magazines/index.html',
      'restaurants/hashi-pick/index.html',
      'restaurants/popular/index.html',
      'restaurants/123/index.html',
      'restaurants/123/menus/10/index.html',
    ]

    await expect(
      Promise.all(
        expectedFiles.map((file) => readFile(join(outputDir, file), 'utf8')),
      ),
    ).resolves.toHaveLength(expectedFiles.length)

    const sitemap = await readFile(join(outputDir, 'sitemap.xml'), 'utf8')
    const detailHtml = await readFile(
      join(outputDir, 'restaurants/123/index.html'),
      'utf8',
    )
    const privateShell = await readFile(
      join(outputDir, 'private-noindex-shell.html'),
      'utf8',
    )
    const homeHtml = await readFile(join(outputDir, 'index.html'), 'utf8')

    expect(sitemap).toContain('https://www.hashi.kr/restaurants/123')
    expect(sitemap).toContain('https://www.hashi.kr/restaurants/123/menus/10')
    expect(sitemap).not.toContain('/magazines/31')
    expect(detailHtml).toContain('<h1>히마와리 스시</h1>')
    expect(detailHtml).toContain('<dt>가격대</dt><dd>JPY 3,000 - 5,000</dd>')
    expect(detailHtml).toContain('<dt>월</dt><dd>11:00 - 20:00</dd>')
    expect(detailHtml).toContain('alt="히마와리 스시 대표 이미지"')
    expect(homeHtml).toContain(
      'href="https://www.instagram.com/p/hashi-home-banner"',
    )
    expect(privateShell).toContain('content="noindex, nofollow"')
    expect(result).toEqual({ magazines: 1, menus: 1, restaurants: 1, urls: 6 })
  })
})
