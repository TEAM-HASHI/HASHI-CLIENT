const checkerboardStyle = {
  backgroundColor: '#f5f5f5',
  backgroundImage:
    'linear-gradient(45deg, #ededed 25%, transparent 25%), linear-gradient(-45deg, #ededed 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ededed 75%), linear-gradient(-45deg, transparent 75%, #ededed 75%)',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundSize: '16px 16px',
} as const

export const ReviewImagePlaceholder = () => {
  return (
    <div
      aria-hidden="true"
      className="size-[92px] shrink-0 rounded-[5px]"
      style={checkerboardStyle}
    />
  )
}
