// Figma 8317:37718/37731/37744/37757, 8317:39060.
// 주황·파랑 북마크의 흰색은 사용자 승인값이다.
export const COLLECTION_COVER_COLORS = {
  red: { background: 'var(--color-primary-400)', color: '#bf2e2e' },
  orange: { background: '#fbb94e', color: 'var(--color-white)' },
  yellow: { background: '#fdec82', color: '#efc53a' },
  green: { background: '#dedc5f', color: 'var(--color-secondary-500)' },
  blue: { background: '#cee2f4', color: 'var(--color-white)' },
  purple: { background: '#c7afda', color: '#a383c7' },
} as const
