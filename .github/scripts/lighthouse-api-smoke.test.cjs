const assert = require('node:assert/strict')
const test = require('node:test')

const {
  createSmokeUrl,
  runApiSmokeCheck,
  validateApiBaseUrl,
} = require('./lighthouse-api-smoke.cjs')

test('validateApiBaseUrl rejects a missing API base URL', () => {
  assert.throws(() => validateApiBaseUrl(''), /VITE_API_BASE_URL/)
})

test('validateApiBaseUrl rejects a non-HTTP API base URL', () => {
  assert.throws(() => validateApiBaseUrl('ftp://example.com'), /HTTP\(S\)/)
})

test('createSmokeUrl builds the public restaurant URL from the API origin', () => {
  assert.equal(
    createSmokeUrl('https://api.example.com/base/'),
    'https://api.example.com/api/v1/restaurants?type=sns-hot&size=1',
  )
})

test('runApiSmokeCheck accepts a successful API response', async () => {
  const result = await runApiSmokeCheck({
    baseUrl: 'https://api.example.com',
    fetchImpl: async () => ({ ok: true, status: 200 }),
  })

  assert.deepEqual(result, { status: 200 })
})

test('runApiSmokeCheck rejects a non-2xx API response', async () => {
  await assert.rejects(
    runApiSmokeCheck({
      baseUrl: 'https://api.example.com',
      fetchImpl: async () => ({ ok: false, status: 503 }),
    }),
    /HTTP 503/,
  )
})

test('runApiSmokeCheck reports a network failure without exposing the base URL', async () => {
  await assert.rejects(
    runApiSmokeCheck({
      baseUrl: 'https://private-api.example.com',
      fetchImpl: async () => {
        throw new Error('socket closed')
      },
    }),
    (error) =>
      /네트워크 요청에 실패/.test(error.message) &&
      !error.message.includes('private-api.example.com'),
  )
})

test('runApiSmokeCheck reports an aborted request as a timeout', async () => {
  const abortError = Object.assign(new Error('aborted'), {
    name: 'AbortError',
  })

  await assert.rejects(
    runApiSmokeCheck({
      baseUrl: 'https://api.example.com',
      fetchImpl: async () => {
        throw abortError
      },
      timeoutMs: 50,
    }),
    /50ms.*시간을 초과/,
  )
})
