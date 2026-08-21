import { describe, expect, it } from 'vitest'

import { extractBearerToken } from '@/shared/api/extractBearerToken'

describe('extractBearerToken', () => {
  it('extracts the token from a Bearer Authorization header', () => {
    const headers = new Headers({
      Authorization: 'Bearer access-token',
    })

    expect(extractBearerToken(headers)).toBe('access-token')
  })

  it.each([undefined, 'Basic access-token', 'Bearer'])(
    'returns undefined for an unsupported Authorization header: %s',
    (authorization) => {
      const headers = new Headers(
        authorization ? { Authorization: authorization } : undefined,
      )

      expect(extractBearerToken(headers)).toBeUndefined()
    },
  )
})
