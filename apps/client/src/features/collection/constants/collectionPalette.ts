export const COLLECTION_COVER_COLORS = {
  red: {
    background: 'var(--color-primary-400)',
    color: 'var(--color-palette-red-strong)',
  },
  orange: {
    background: 'var(--color-palette-orange-soft)',
    color: 'var(--color-palette-orange-strong)',
  },
  yellow: {
    background: 'var(--color-palette-yellow-soft)',
    color: 'var(--color-palette-yellow-strong)',
  },
  green: {
    background: 'var(--color-palette-green-soft)',
    color: 'var(--color-secondary-500)',
  },
  blue: {
    background: 'var(--color-palette-blue-soft)',
    color: 'var(--color-palette-blue-strong)',
  },
  purple: {
    background: 'var(--color-palette-purple-soft)',
    color: 'var(--color-palette-purple-strong)',
  },
} as const

// Figma collection_pin: 커버와 달리 주황·노랑·초록은 진한 팔레트를 사용한다.
export const COLLECTION_PIN_COLORS = {
  red: COLLECTION_COVER_COLORS.red.background,
  orange: COLLECTION_COVER_COLORS.orange.color,
  yellow: COLLECTION_COVER_COLORS.yellow.color,
  green: COLLECTION_COVER_COLORS.green.color,
  blue: COLLECTION_COVER_COLORS.blue.background,
  purple: COLLECTION_COVER_COLORS.purple.background,
} as const
