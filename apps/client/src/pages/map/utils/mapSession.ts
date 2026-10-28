import type { MapSessionSnapshot } from '@/pages/map/types'
import { parseMapOAuthSnapshot } from '@/pages/map/utils/parseMapOAuthSnapshot'

const OAUTH_RESUME_KEY = 'hashi:map:oauth-resume:v1'
const SESSION_TTL = 300_000
export const discardMapOAuthResume = () => {
  try {
    window.sessionStorage.removeItem(OAUTH_RESUME_KEY)
  } catch {
    /* Storage may be disabled. */
  }
}

let snapshot: MapSessionSnapshot | null = null
let leftAt: number | null = null
export const clearMapSession = () => {
  snapshot = null
  leftAt = null
  discardMapOAuthResume()
}
export const writeMapSession = (value: MapSessionSnapshot) => {
  snapshot = value
}
export const leaveMapSession = (now = Date.now()) => {
  leftAt ??= now
}
export const readMapSession = (now = Date.now()) => {
  if (leftAt !== null && now - leftAt >= SESSION_TTL) return null
  return snapshot
}
export const enterMapSession = (now = Date.now()) => {
  snapshot = readMapSession(now)
  leftAt = null
  return snapshot
}

// Called only by the map-origin login button, not ordinary map navigation/reload.
export const persistMapSessionForOAuth = (now = Date.now()) => {
  discardMapOAuthResume()
  const current = readMapSession(now)
  if (!current) return
  try {
    window.sessionStorage.setItem(
      OAUTH_RESUME_KEY,
      JSON.stringify({
        version: 1,
        leftAt: leftAt ?? now,
        snapshot: current,
      }),
    )
  } catch {
    /* A quota or privacy restriction must not prevent login. */
  }
}

// The authenticated map entry consumes the checkpoint once, including invalid data.
export const restoreMapSessionAfterOAuth = (now = Date.now()) => {
  let stored: string | null = null
  try {
    stored = window.sessionStorage.getItem(OAUTH_RESUME_KEY)
  } catch {
    /* Optional resume. */
  }
  discardMapOAuthResume()
  if (!stored) return readMapSession(now)
  try {
    const value = JSON.parse(stored)
    if (
      value?.version !== 1 ||
      typeof value.leftAt !== 'number' ||
      !Number.isFinite(value.leftAt) ||
      now < value.leftAt ||
      now - value.leftAt >= SESSION_TTL
    )
      return readMapSession(now)
    const restored = parseMapOAuthSnapshot(value.snapshot)
    if (!restored) return readMapSession(now)
    snapshot = { ...restored, restoreAfterOAuth: true }
    leftAt = value.leftAt
  } catch {
    /* Corrupt storage is ignored. */
  }
  return readMapSession(now)
}
