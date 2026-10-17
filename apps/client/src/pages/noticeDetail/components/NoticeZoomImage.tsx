import { useRef, useState, type TouchEvent } from 'react'

import { NoticeAttachmentImage } from '@/pages/noticeDetail/components/NoticeAttachmentImage'

type Transform = { scale: number; x: number; y: number }
type Gesture = {
  distance: number
  x: number
  y: number
  centerX: number
  centerY: number
  width: number
  height: number
  transform: Transform
}

const INITIAL_TRANSFORM: Transform = { scale: 1, x: 0, y: 0 }
const clamp = (value: number, limit: number) =>
  Math.min(Math.max(value, -limit), limit)

const getTouchPosition = (touches: TouchEvent['touches']) => {
  const first = touches[0]
  const second = touches[1] ?? first
  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
    distance: Math.hypot(
      first.clientX - second.clientX,
      first.clientY - second.clientY,
    ),
  }
}

export const NoticeZoomImage = ({ alt, src }: { alt: string; src: string }) => {
  const [transform, setTransform] = useState(INITIAL_TRANSFORM)
  const transformRef = useRef(INITIAL_TRANSFORM)
  const gestureRef = useRef<Gesture | null>(null)

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2 && transformRef.current.scale === 1) return
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    gestureRef.current = {
      ...getTouchPosition(event.touches),
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
      transform: transformRef.current,
    }
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture || event.touches.length === 0) return
    event.stopPropagation()
    const position = getTouchPosition(event.touches)
    const scale =
      event.touches.length >= 2 && gesture.distance > 0
        ? Math.min(
            Math.max(
              (position.distance / gesture.distance) * gesture.transform.scale,
              1,
            ),
            4,
          )
        : gesture.transform.scale
    const ratio = scale / gesture.transform.scale
    const next = {
      scale,
      x: clamp(
        position.x -
          gesture.centerX -
          (gesture.x - gesture.centerX - gesture.transform.x) * ratio,
        (gesture.width * (scale - 1)) / 2,
      ),
      y: clamp(
        position.y -
          gesture.centerY -
          (gesture.y - gesture.centerY - gesture.transform.y) * ratio,
        (gesture.height * (scale - 1)) / 2,
      ),
    }
    transformRef.current = next
    setTransform(next)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!gestureRef.current) return
    event.stopPropagation()
    gestureRef.current = null
    if (event.touches.length > 0) handleTouchStart(event)
  }

  return (
    <div
      className="size-full touch-none overflow-hidden"
      onTouchStartCapture={handleTouchStart}
      onTouchMoveCapture={handleTouchMove}
      onTouchEndCapture={handleTouchEnd}
      onTouchCancelCapture={handleTouchEnd}
    >
      <div
        className="size-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <NoticeAttachmentImage alt={alt} src={src} />
      </div>
    </div>
  )
}
