import ky from 'ky'

const API_TIMEOUT = 10_000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL 환경 변수가 필요합니다.')
}

export const apiClient = ky.create({
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  retry: 0,
  throwHttpErrors: false,
})
