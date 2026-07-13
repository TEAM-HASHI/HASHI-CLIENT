interface LocationLike {
  pathname: string
  search?: string
  hash?: string
}

const checkIsLocationLike = (value: unknown): value is LocationLike => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pathname' in value &&
    typeof value.pathname === 'string' &&
    value.pathname.startsWith('/') &&
    !value.pathname.startsWith('//')
  )
}

const normalizePathPart = (value: string | undefined) => {
  return value ?? ''
}

export const getPathFromLocation = (location: LocationLike) => {
  return `${location.pathname}${normalizePathPart(location.search)}${normalizePathPart(location.hash)}`
}

export const getRedirectToFromLocationState = (state: unknown) => {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('from' in state) ||
    !checkIsLocationLike(state.from)
  ) {
    return undefined
  }

  return getPathFromLocation(state.from)
}
