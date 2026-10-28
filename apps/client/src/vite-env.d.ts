/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_KAKAO_CLIENT_ID: string
  readonly VITE_KAKAO_REDIRECT_URI: string
  readonly VITE_DEV_USER_ACCESS_TOKEN?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_VERCEL_ENV: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
