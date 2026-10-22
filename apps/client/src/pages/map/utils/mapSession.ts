import type { MapSessionSnapshot } from '@/pages/map/types'

let snapshot: MapSessionSnapshot | null = null
let leftAt: number | null = null
export const clearMapSession = () => {
  snapshot = null
  leftAt = null
}
export const writeMapSession = (value: MapSessionSnapshot) => {
  snapshot = value
}
export const leaveMapSession = (now = Date.now()) => {
  leftAt ??= now
}
export const readMapSession = (now = Date.now()) => {
  if (leftAt !== null && now - leftAt >= 300_000) return null
  return snapshot
}
export const enterMapSession = (now = Date.now()) => {
  snapshot = readMapSession(now)
  leftAt = null
  return snapshot
}
