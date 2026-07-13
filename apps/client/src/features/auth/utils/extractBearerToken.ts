export const extractBearerToken = (headers: Headers) => {
  const authorizationHeader = headers.get('Authorization')
  const bearerMatch = authorizationHeader?.match(/^Bearer\s+(\S+)$/i)

  return bearerMatch?.[1]
}
