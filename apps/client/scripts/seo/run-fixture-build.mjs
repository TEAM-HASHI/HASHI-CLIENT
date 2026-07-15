import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

const appDirectory = process.cwd()
const fixturePath = process.env.SEO_API_FIXTURE_PATH

if (!fixturePath) {
  throw new Error('SEO_API_FIXTURE_PATH 환경 변수가 필요합니다.')
}

if (process.env.VERCEL_ENV === 'production') {
  throw new Error('운영 빌드에서는 SEO API fixture를 사용할 수 없습니다.')
}

const fixture = JSON.parse(
  await readFile(resolve(appDirectory, fixturePath), 'utf8'),
)

if (
  typeof fixture !== 'object' ||
  fixture === null ||
  typeof fixture.routes !== 'object' ||
  fixture.routes === null
) {
  throw new Error('SEO API fixture 형식이 올바르지 않습니다.')
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  const route = fixture.routes[url.pathname]

  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (!route) {
    response.statusCode = 404
    response.end(
      JSON.stringify({
        success: false,
        code: 'NOT_FOUND',
        message: `Fixture route not found: ${url.pathname}`,
        data: null,
      }),
    )
    return
  }

  response.statusCode = 200
  response.end(
    JSON.stringify({
      success: true,
      code: 'SUCCESS',
      message: 'fixture response',
      data: route,
    }),
  )
})

await new Promise((resolveListen, rejectListen) => {
  server.once('error', rejectListen)
  server.listen(0, '127.0.0.1', resolveListen)
})

const address = server.address()

if (!address || typeof address === 'string') {
  server.close()
  throw new Error('SEO fixture server 주소를 확인할 수 없습니다.')
}

const child = spawn('pnpm', ['run', 'build'], {
  cwd: appDirectory,
  env: {
    ...process.env,
    SENTRY_AUTH_TOKEN: '',
    VERCEL_ENV: 'preview',
    VITE_API_BASE_URL: `http://127.0.0.1:${address.port}`,
  },
  stdio: 'inherit',
})

const exitCode = await new Promise((resolveExit, rejectExit) => {
  child.once('error', rejectExit)
  child.once('exit', (code, signal) => {
    if (signal) {
      rejectExit(
        new Error(`Fixture build가 ${signal} signal로 종료되었습니다.`),
      )
      return
    }

    resolveExit(code ?? 1)
  })
}).finally(
  () =>
    new Promise((resolveClose) => {
      server.close(resolveClose)
    }),
)

if (exitCode !== 0) {
  process.exitCode = exitCode
}
