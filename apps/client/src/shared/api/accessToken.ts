const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'

const getStoredAccessToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

const getDevelopmentAccessToken = () => {
  if (!import.meta.env.DEV) {
    return null
  }

  return import.meta.env.VITE_DEV_USER_ACCESS_TOKEN?.trim() || null
}

export const getApiAccessToken = () =>
  getStoredAccessToken() ?? getDevelopmentAccessToken()

export const setApiAccessToken = (accessToken: string) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export const clearApiAccessToken = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}
