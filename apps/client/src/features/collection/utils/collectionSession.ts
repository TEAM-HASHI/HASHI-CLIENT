import { getAuthSessionVersion } from '@/shared/auth/authSession'

export const assertCollectionSession = (sessionVersion: number) => {
  if (sessionVersion !== getAuthSessionVersion()) {
    throw new Error('Collection auth session changed')
  }
}

export const runWithCollectionSession = async <T>(
  sessionVersion: number,
  operation: () => Promise<T>,
): Promise<T> => {
  assertCollectionSession(sessionVersion)
  try {
    const result = await operation()
    assertCollectionSession(sessionVersion)
    return result
  } catch (error) {
    assertCollectionSession(sessionVersion)
    throw error
  }
}
