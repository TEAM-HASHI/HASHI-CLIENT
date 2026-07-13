const getDevelopmentAccessToken = () => {
  if (!import.meta.env.DEV) {
    return null
  }

  return import.meta.env.VITE_DEV_USER_ACCESS_TOKEN?.trim() || null
}

export const getApiAccessToken = () => getDevelopmentAccessToken()
