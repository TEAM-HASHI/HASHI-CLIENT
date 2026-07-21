const DEFAULT_TIMEOUT_MS = 10_000
const SMOKE_ENDPOINT = '/api/v1/restaurants?type=sns-hot&size=1'

function validateApiBaseUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      'Lighthouse API smoke check: VITE_API_BASE_URL GitHub Actions Repository Variable이 필요합니다.',
    )
  }

  let url

  try {
    url = new URL(value.trim())
  } catch {
    throw new Error(
      'Lighthouse API smoke check: VITE_API_BASE_URL은 유효한 HTTP(S) 절대 URL이어야 합니다.',
    )
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      'Lighthouse API smoke check: VITE_API_BASE_URL은 유효한 HTTP(S) 절대 URL이어야 합니다.',
    )
  }

  return url
}

function createSmokeUrl(baseUrl) {
  const url = validateApiBaseUrl(baseUrl)

  return new URL(SMOKE_ENDPOINT, url.origin).toString()
}

async function runApiSmokeCheck({
  baseUrl,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const url = createSmokeUrl(baseUrl)

  let response

  try {
    response = await fetchImpl(url, {
      headers: {
        accept: 'application/json',
      },
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new Error(
        `Lighthouse API smoke check: ${timeoutMs}ms 제한 시간을 초과했습니다.`,
        { cause: error },
      )
    }

    throw new Error(
      'Lighthouse API smoke check: 네트워크 요청에 실패했습니다.',
      { cause: error },
    )
  }

  if (!response.ok) {
    throw new Error(
      `Lighthouse API smoke check: API가 HTTP ${response.status} 응답을 반환했습니다.`,
    )
  }

  return { status: response.status }
}

if (require.main === module) {
  runApiSmokeCheck({ baseUrl: process.env.VITE_API_BASE_URL })
    .then(({ status }) => {
      console.log(`Lighthouse API smoke check passed (HTTP ${status}).`)
    })
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}

module.exports = {
  createSmokeUrl,
  runApiSmokeCheck,
  validateApiBaseUrl,
}
