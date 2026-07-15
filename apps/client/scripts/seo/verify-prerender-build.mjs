import { access, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const appDirectory = process.cwd()
const clientDirectory = resolve(appDirectory, 'dist/client')
const manifestPath = resolve(appDirectory, '.seo/public-route-manifest.json')

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

const getHtmlPath = (path) =>
  path === '/'
    ? resolve(clientDirectory, 'index.html')
    : resolve(clientDirectory, path.slice(1), 'index.html')

const assertIncludes = (source, expected, context) => {
  if (!source.includes(expected)) {
    throw new Error(`${context}에 ${expected}가 없습니다.`)
  }
}

await access(resolve(clientDirectory, '__spa-fallback.html'))
await access(resolve(clientDirectory, 'robots.txt'))
await access(resolve(clientDirectory, 'sitemap.xml'))

for (const path of manifest.paths) {
  const html = await readFile(getHtmlPath(path), 'utf8')

  assertIncludes(html, 'rel="canonical"', `${path} HTML`)
  assertIncludes(html, 'property="og:', `${path} HTML`)

  if (html.includes('로그인 상태를 확인하고 있어요')) {
    throw new Error(`${path} HTML이 인증 복구 loading 화면만 포함합니다.`)
  }

  if (path.startsWith('/restaurants/') && /^\/restaurants\/\d+$/.test(path)) {
    assertIncludes(html, 'application/ld+json', `${path} HTML`)
  }
}

const sitemap = await readFile(resolve(clientDirectory, 'sitemap.xml'), 'utf8')

for (const path of manifest.paths) {
  const canonicalUrl = new URL(path, 'https://www.hashi.kr').toString()
  assertIncludes(sitemap, canonicalUrl, 'sitemap.xml')
}

if (sitemap.includes('/search') || sitemap.includes('<lastmod>')) {
  throw new Error(
    'sitemap.xml에 비색인 경로 또는 근거 없는 lastmod가 있습니다.',
  )
}

const serviceWorker = await readFile(resolve(clientDirectory, 'sw.js'), 'utf8')

if (!/url:"\/__spa-fallback\.html",revision:"[^"]+"/.test(serviceWorker)) {
  throw new Error('SPA fallback precache에 배포별 revision이 없습니다.')
}

for (const path of manifest.paths) {
  if (
    path.startsWith('/restaurants/') &&
    serviceWorker.includes(`${path.slice(1)}/index.html`)
  ) {
    throw new Error(`서비스 워커가 ${path} 프리렌더 HTML을 precache합니다.`)
  }
}

try {
  const serverDirectory = await stat(resolve(appDirectory, 'dist/server'))

  if (serverDirectory.isDirectory()) {
    throw new Error('ssr:false 빌드에 runtime server 디렉터리가 남아 있습니다.')
  }
} catch (cause) {
  if (cause instanceof Error && 'code' in cause && cause.code === 'ENOENT') {
    // Expected: React Router removes the server build after prerendering.
  } else {
    throw cause
  }
}

console.log(
  `[seo] 프리렌더 빌드 검증 완료: ${manifest.paths.length}개 공개 HTML`,
)
