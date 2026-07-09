import ky from 'ky'
import { getAdminAccessToken } from '@/shared/auth/adminSession'

const API_TIMEOUT = 10_000
const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:8080'

export const apiClient = ky.create({
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  retry: 0,
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getAdminAccessToken()

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})
