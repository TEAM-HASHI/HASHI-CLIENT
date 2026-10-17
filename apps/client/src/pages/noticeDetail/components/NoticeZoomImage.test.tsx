import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NoticeZoomImage } from '@/pages/noticeDetail/components/NoticeZoomImage'

const touch = (clientX: number, clientY: number) => ({ clientX, clientY })

const renderImage = () => {
  const onTouchStart = vi.fn()
  const onTouchMove = vi.fn()
  render(
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove}>
      <NoticeZoomImage alt="공지 이미지" src="/notice.webp" />
    </div>,
  )
  const transform = screen.getByRole('img').parentElement!
  const surface = transform.parentElement!
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 200,
    bottom: 200,
    width: 200,
    height: 200,
    toJSON: () => ({}),
  })
  return { surface, transform, onTouchStart, onTouchMove }
}

describe('NoticeZoomImage', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('lets one-finger swipes reach the carousel at the original size', () => {
    const { surface, onTouchStart, onTouchMove } = renderImage()
    fireEvent.touchStart(surface, { touches: [touch(50, 100)] })
    fireEvent.touchMove(surface, { touches: [touch(100, 100)] })
    expect(onTouchStart).toHaveBeenCalledOnce()
    expect(onTouchMove).toHaveBeenCalledOnce()
  })

  it('pinches to zoom, pans inside bounds and keeps gestures out of the carousel', () => {
    const { surface, transform, onTouchStart, onTouchMove } = renderImage()
    fireEvent.touchStart(surface, {
      touches: [touch(50, 100), touch(150, 100)],
    })
    fireEvent.touchMove(surface, { touches: [touch(0, 100), touch(200, 100)] })
    expect(transform).toHaveStyle({ transform: 'translate(0px, 0px) scale(2)' })
    fireEvent.touchEnd(surface, { touches: [touch(100, 100)] })
    fireEvent.touchMove(surface, { touches: [touch(500, 500)] })
    expect(transform).toHaveStyle({
      transform: 'translate(100px, 100px) scale(2)',
    })
    expect(onTouchStart).not.toHaveBeenCalled()
    expect(onTouchMove).not.toHaveBeenCalled()
  })

  it('limits enlargement and returns to the original size when pinched inward', () => {
    const { surface, transform } = renderImage()
    fireEvent.touchStart(surface, {
      touches: [touch(50, 100), touch(150, 100)],
    })
    fireEvent.touchMove(surface, {
      touches: [touch(-500, 100), touch(700, 100)],
    })
    expect(transform).toHaveStyle({ transform: 'translate(0px, 0px) scale(4)' })
    fireEvent.touchMove(surface, { touches: [touch(90, 100), touch(110, 100)] })
    expect(transform).toHaveStyle({ transform: 'translate(0px, 0px) scale(1)' })
  })
})
