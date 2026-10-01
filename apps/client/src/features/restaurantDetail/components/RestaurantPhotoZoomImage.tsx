import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'

export const RestaurantPhotoZoomImage = ({ src }: { src: string }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ distance: number; scale: number } | null>(null)

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })
    const points = [...pointers.current.values()]
    if (points.length === 2 && pinch.current) {
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y,
      )
      const scale = Math.min(
        4,
        Math.max(1, (pinch.current.scale * distance) / pinch.current.distance),
      )
      setTransform({ scale, x: 0, y: 0 })
    } else if (transform.scale > 1) {
      const maxX = (event.currentTarget.clientWidth * (transform.scale - 1)) / 2
      const maxY =
        (event.currentTarget.clientHeight * (transform.scale - 1)) / 2
      setTransform((current) => ({
        ...current,
        x: Math.max(
          -maxX,
          Math.min(maxX, current.x + event.clientX - previous.x),
        ),
        y: Math.max(
          -maxY,
          Math.min(maxY, current.y + event.clientY - previous.y),
        ),
      }))
    }
  }

  return (
    <div
      className="size-full overflow-hidden"
      style={{ touchAction: 'none' }}
      onDoubleClick={() =>
        setTransform((current) => ({
          scale: current.scale === 1 ? 2 : 1,
          x: 0,
          y: 0,
        }))
      }
      onTouchStartCapture={(event) => {
        if (transform.scale > 1 || event.touches.length > 1)
          event.stopPropagation()
      }}
      onMouseDownCapture={(event) => {
        if (transform.scale > 1) event.stopPropagation()
      }}
      onPointerDown={(event) => {
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })
        const points = [...pointers.current.values()]
        if (points.length === 2) {
          pinch.current = {
            distance: Math.max(
              1,
              Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
            ),
            scale: transform.scale,
          }
        }
        if (transform.scale > 1)
          event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        pointers.current.delete(event.pointerId)
        pinch.current = null
      }}
      onPointerCancel={(event) => {
        pointers.current.delete(event.pointerId)
        pinch.current = null
      }}
    >
      <div
        className="size-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        <RestaurantImage
          src={src}
          className="pointer-events-none size-full object-contain select-none"
          markSize="lg"
        />
      </div>
    </div>
  )
}
