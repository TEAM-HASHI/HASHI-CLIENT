import ky from 'ky'

const API_TIMEOUT = 10_000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL 환경 변수가 필요합니다.')
}

const getAccessToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export const apiClient = ky.create({
  baseUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = getAccessToken()

        if (!accessToken) {
          return
        }

        request.headers.set('Authorization', `Bearer ${accessToken}`)
      },
    ],
  },
  timeout: API_TIMEOUT,
  retry: 0,
  throwHttpErrors: false,
})
