import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DragPanel } from './DragPanel'
import type { DragPanelRenderState } from './DragPanel'

let resize: ResizeObserverCallback

beforeEach(() => {
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number
      isPrimary: boolean

      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init)
        this.pointerId = init.pointerId ?? 1
        this.isPrimary = init.isPrimary ?? true
      }
    },
  )

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback
      }

      observe() {}
      disconnect() {}
    },
  )

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 700,
    height: 700,
    width: 393,
    left: 0,
    right: 393,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const renderPanel = (height = 318) =>
  render(
    <DragPanel
      height={height}
      normalHeight={318}
      maxHeight={794}
      onHeightChange={vi.fn()}
      aria-label="Results"
      handleLabel="Panel height"
    >
      <button type="button">Item</button>
    </DragPanel>,
  )

describe('DragPanel', () => {
  it.each([700, 180])(
    'keeps fullscreen and collapse controls when available height becomes %ipx',
    (availableHeight) => {
      const onHeightChange = vi.fn()
      const onStageCommit = vi.fn()
      const props = {
        normalHeight: 240,
        onHeightChange,
        onStageCommit,
        'aria-label': 'Results',
        handleLabel: 'Panel height',
        header: ({ isFullscreen, collapse }: DragPanelRenderState) =>
          isFullscreen ? <button onClick={collapse}>Back</button> : null,
        children: <p>Row</p>,
      }
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600)
      const Preview = () => {
        const [height, setHeight] = useState(240)
        return (
          <DragPanel
            {...props}
            height={height}
            onHeightChange={(next) => {
              onHeightChange(next)
              setHeight(next)
            }}
          />
        )
      }
      render(<Preview />)
      const handle = screen.getByRole('slider')
      fireEvent.keyDown(handle, { key: 'End' })
      onStageCommit.mockClear()
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(availableHeight)
      fireEvent.resize(window)
      expect(handle).toHaveAttribute('aria-valuenow', String(availableHeight))
      expect(handle).not.toBeVisible()
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      expect(onStageCommit).not.toHaveBeenCalled()
      fireEvent.wheel(screen.getByText('Row').parentElement!, { deltaY: -80 })
      expect(onHeightChange).toHaveBeenLastCalledWith(
        Math.min(240, availableHeight),
      )
      expect(
        screen.queryByRole('button', { name: 'Back' }),
      ).not.toBeInTheDocument()
      expect(handle).toBeVisible()
    },
  )

  it('restores fullscreen immediately when a second touch interrupts a pull', () => {
    const onHeightChange = vi.fn()
    render(
      <DragPanel
        height={700}
        normalHeight={240}
        onHeightChange={onHeightChange}
        aria-label="Results"
        handleLabel="Panel height"
      >
        <p>Row</p>
      </DragPanel>,
    )
    const list = screen.getByText('Row').parentElement!
    const first = { identifier: 1, clientX: 50, clientY: 100 }
    const moved = { ...first, clientY: 160 }
    fireEvent.touchStart(list, { touches: [first] })
    fireEvent.touchMove(list, { touches: [moved] })
    expect(screen.getByRole('slider', { hidden: true })).toHaveAttribute(
      'aria-valuenow',
      '640',
    )
    fireEvent.touchStart(list, {
      touches: [moved, { ...moved, identifier: 2 }],
    })
    expect(screen.getByRole('slider', { hidden: true })).toHaveAttribute(
      'aria-valuenow',
      '700',
    )
    fireEvent.touchEnd(list)
    expect(onHeightChange).not.toHaveBeenCalled()
  })

  it('expands in place and collapses from the header without replacing content', () => {
    const onHeightChange = vi.fn()
    const props = {
      normalHeight: 240,
      onHeightChange,
      'aria-label': 'Results',
      handleLabel: 'Panel height',
      header: ({ isFullscreen, collapse }: DragPanelRenderState) =>
        isFullscreen ? <button onClick={collapse}>Back</button> : null,
      floating: ({ collapse }: DragPanelRenderState) => (
        <button onClick={collapse}>Collapse</button>
      ),
      children: <input defaultValue="Draft" />,
    }
    const { rerender } = render(<DragPanel {...props} height={240} />)
    const input = screen.getByRole('textbox')
    const handle = screen.getByRole('slider')
    handle.focus()
    fireEvent.keyDown(handle, { key: 'End' })
    expect(onHeightChange).toHaveBeenLastCalledWith(700)
    rerender(<DragPanel {...props} height={700} />)
    expect(handle).not.toBeVisible()
    expect(input.closest('[tabindex="-1"]')).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onHeightChange).toHaveBeenLastCalledWith(240)
    rerender(<DragPanel {...props} height={240} />)
    expect(handle).toHaveFocus()
    expect(screen.getByRole('textbox')).toBe(input)
    fireEvent.keyDown(handle, { key: 'End' })
    rerender(<DragPanel {...props} height={700} />)
    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    expect(onHeightChange).toHaveBeenLastCalledWith(240)
    rerender(<DragPanel {...props} height={240} />)
    screen.getByRole('button', { name: 'Collapse' }).focus()
    rerender(<DragPanel {...props} height={30} />)
    expect(handle).toHaveFocus()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('only collapses a fullscreen list on downward input starting at its top', () => {
    const onHeightChange = vi.fn()
    render(
      <DragPanel
        height={700}
        normalHeight={240}
        onHeightChange={onHeightChange}
        aria-label="Results"
        handleLabel="Panel height"
      >
        <p>Row</p>
      </DragPanel>,
    )
    const list = screen.getByText('Row').parentElement!
    fireEvent.wheel(list, { deltaY: -80, ctrlKey: true })
    expect(onHeightChange).not.toHaveBeenCalled()
    list.scrollTop = 100
    fireEvent.wheel(list, { deltaY: -80 })
    fireEvent.touchStart(list, {
      touches: [{ identifier: 1, clientX: 50, clientY: 100 }],
    })
    list.scrollTop = 0
    fireEvent.touchMove(list, {
      touches: [{ identifier: 1, clientX: 50, clientY: 160 }],
    })
    fireEvent.touchEnd(list)
    expect(onHeightChange).not.toHaveBeenCalled()
    fireEvent.touchStart(list, {
      touches: [{ identifier: 1, clientX: 50, clientY: 100 }],
    })
    fireEvent.touchMove(list, {
      touches: [{ identifier: 1, clientX: 50, clientY: 160 }],
    })
    fireEvent.touchCancel(list)
    expect(onHeightChange).not.toHaveBeenCalled()
    fireEvent.touchStart(list, {
      touches: [{ identifier: 1, clientX: 50, clientY: 100 }],
    })
    fireEvent.touchMove(list, {
      touches: [{ identifier: 1, clientX: 50, clientY: 160 }],
    })
    fireEvent.touchEnd(list)
    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(240)
    onHeightChange.mockClear()
    fireEvent.wheel(list, { deltaY: -4 })
    fireEvent.wheel(list, { deltaY: -4 })
    expect(onHeightChange).not.toHaveBeenCalled()
    fireEvent.wheel(list, { deltaY: -4 })
    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(240)
    onHeightChange.mockClear()
    fireEvent.wheel(list, { deltaY: -1, deltaMode: 1 })
    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(240)
  })

  it.each([false, true])(
    'uses the same off-stage keyboard and pointer behavior with callback=%s',
    (withCallback) => {
      const onHeightChange = vi.fn()
      render(
        <DragPanel
          height={200}
          normalHeight={240}
          maxHeight={520}
          onHeightChange={onHeightChange}
          onStageCommit={withCallback ? vi.fn() : undefined}
          aria-label="Results"
          handleLabel="Panel height"
        >
          Content
        </DragPanel>,
      )
      const handle = screen.getByRole('slider')
      fireEvent.keyDown(handle, { key: 'ArrowUp' })
      expect(onHeightChange).toHaveBeenLastCalledWith(240)
      onHeightChange.mockClear()
      fireEvent.keyDown(handle, { key: 'End', repeat: true })
      fireEvent.pointerDown(handle, { clientY: 500 })
      fireEvent.pointerUp(handle, { clientY: 495 })
      expect(onHeightChange).not.toHaveBeenCalled()
      fireEvent.pointerDown(handle, { clientY: 500 })
      fireEvent.pointerUp(handle, { clientY: 480 })
      expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(520)
    },
  )

  const semanticPanel = (height = 240, normalHeight = 240, maxHeight = 520) => {
    const onStageCommit = vi.fn()
    const onHeightChange = vi.fn()
    const props = {
      height,
      normalHeight,
      maxHeight,
      onStageCommit,
      onHeightChange,
      'aria-label': 'Results',
      handleLabel: 'Panel height',
      children: 'Body',
    }
    return {
      ...render(<DragPanel {...props} />),
      props,
      onStageCommit,
      onHeightChange,
    }
  }

  it('commits a semantic maximum only on deliberate keyboard input', () => {
    const { props, rerender, onStageCommit } = semanticPanel()
    expect(onStageCommit).not.toHaveBeenCalled()
    const handle = screen.getByRole('slider')
    fireEvent.keyDown(handle, { key: 'End', repeat: true })
    expect(onStageCommit).not.toHaveBeenCalled()
    fireEvent.keyDown(handle, { key: 'End' })
    expect(onStageCommit).toHaveBeenCalledExactlyOnceWith({
      stage: 'maximum',
      height: 520,
      input: 'keyboard',
    })
    rerender(<DragPanel {...props} height={520} />)
    fireEvent.keyDown(handle, { key: 'End' })
    expect(onStageCommit).toHaveBeenCalledTimes(1)
  })

  it('distinguishes normal and maximum when their physical heights coincide', () => {
    const { onStageCommit } = semanticPanel(700, 750, 800)
    const handle = screen.getByRole('slider')
    expect(handle).toHaveAttribute('aria-valuenow', '700')
    fireEvent.keyDown(handle, { key: 'ArrowUp' })
    expect(onStageCommit).toHaveBeenLastCalledWith({
      stage: 'maximum',
      height: 700,
      input: 'keyboard',
    })
    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    expect(onStageCommit).toHaveBeenLastCalledWith({
      stage: 'normal',
      height: 700,
      input: 'keyboard',
    })
  })

  it('does not commit on resize or external height correction during a drag', () => {
    const { props, rerender, onStageCommit, onHeightChange } = semanticPanel()
    const handle = screen.getByRole('slider')
    fireEvent.pointerDown(handle, { clientY: 500 })
    rerender(<DragPanel {...props} maxHeight={400} height={400} />)
    fireEvent.pointerUp(handle, { clientY: 100 })
    act(() => resize([], {} as ResizeObserver))
    expect(onStageCommit).not.toHaveBeenCalled()
    expect(onHeightChange).not.toHaveBeenCalled()
  })

  it('commits pointer stage only outside the dead zone', () => {
    const { onStageCommit } = semanticPanel()
    const handle = screen.getByRole('slider')
    fireEvent.pointerDown(handle, { clientY: 500 })
    fireEvent.pointerUp(handle, { clientY: 495 })
    expect(onStageCommit).not.toHaveBeenCalled()
    fireEvent.pointerDown(handle, { clientY: 500 })
    fireEvent.pointerUp(handle, { clientY: 480 })
    expect(onStageCommit).toHaveBeenCalledExactlyOnceWith({
      stage: 'maximum',
      height: 520,
      input: 'pointer',
    })
  })

  it('suppresses expansion events when no content space is available', () => {
    const { onStageCommit } = semanticPanel(20, 20, 20)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' })
    expect(onStageCommit).not.toHaveBeenCalled()
  })

  it('allows a clamped summary to expand again after the caller restores normal height', () => {
    const { props, rerender, onStageCommit } = semanticPanel(240, 240, 180)
    const handle = screen.getByRole('slider')
    fireEvent.pointerDown(handle, { clientY: 500 })
    fireEvent.pointerUp(handle, { clientY: 480 })
    expect(onStageCommit).toHaveBeenLastCalledWith({
      stage: 'maximum',
      height: 180,
      input: 'pointer',
    })
    rerender(<DragPanel {...props} height={180} />)
    rerender(<DragPanel {...props} height={240} />)
    fireEvent.keyDown(handle, { key: 'End' })
    expect(onStageCommit).toHaveBeenCalledTimes(2)
  })

  it('does not confirm maximum when viewport shrinks during a drag', () => {
    const { onStageCommit } = semanticPanel()
    const handle = screen.getByRole('slider')
    fireEvent.pointerDown(handle, { clientY: 500 })
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(180)
    fireEvent.resize(window)
    expect(handle).toHaveAttribute('aria-valuenow', '180')
    fireEvent.pointerUp(handle, { clientY: 100 })
    expect(onStageCommit).not.toHaveBeenCalled()
  })

  it('keeps the panel above the visible viewport bottom', () => {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(500)

    renderPanel(794)

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '500')
    expect(screen.getByRole('region')).toHaveStyle({ bottom: '200px' })
  })

  it('clamps height to available container space and responds to resizing', () => {
    renderPanel(794)

    const handle = screen.getByRole('slider')

    expect(handle).toHaveAttribute('aria-valuenow', '700')

    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue({
      top: 0,
      bottom: 400,
      height: 400,
      width: 393,
      left: 0,
      right: 393,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    act(() => resize([], {} as ResizeObserver))

    expect(handle).toHaveAttribute('aria-valuenow', '400')
  })

  it('keeps a handle at the collapsed floor and makes content inert', () => {
    renderPanel(0)

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30')
    expect(screen.getByText('Item').closest('[inert]')).toBeInTheDocument()
  })

  it('keeps the same content mounted across collapse and expansion', () => {
    const props = {
      normalHeight: 318,
      maxHeight: 682,
      onHeightChange: vi.fn(),
      'aria-label': 'Results',
      handleLabel: 'Panel height',
    }

    const { rerender } = render(
      <DragPanel {...props} height={318}>
        <input defaultValue="Draft" />
      </DragPanel>,
    )

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Preserved' } })

    rerender(
      <DragPanel {...props} height={30}>
        <input defaultValue="Draft" />
      </DragPanel>,
    )

    rerender(
      <DragPanel {...props} height={318}>
        <input defaultValue="Draft" />
      </DragPanel>,
    )

    expect(screen.getByRole('textbox')).toBe(input)
    expect(input).toHaveValue('Preserved')
  })

  it.each([
    { name: 'up one stage', height: 318, start: 500, end: 480, expected: 682 },
    { name: 'down one stage', height: 318, start: 300, end: 320, expected: 30 },
    {
      name: 'up across the intermediate stage',
      height: 30,
      start: 700,
      end: 300,
      expected: 682,
    },
    {
      name: 'down across the intermediate stage',
      height: 682,
      start: 200,
      end: 600,
      expected: 30,
    },
  ])(
    'moves $name after a completed drag',
    ({ height, start, end, expected }) => {
      const onHeightChange = vi.fn()
      render(
        <DragPanel
          height={height}
          normalHeight={318}
          maxHeight={682}
          onHeightChange={onHeightChange}
          aria-label="Results"
          handleLabel="Panel height"
        >
          Content
        </DragPanel>,
      )
      const handle = screen.getByRole('slider')
      fireEvent.pointerDown(handle, { clientY: start, pointerId: 1 })
      fireEvent.pointerMove(handle, { clientY: end, pointerId: 1 })
      expect(onHeightChange).not.toHaveBeenCalled()
      fireEvent.pointerUp(handle, { clientY: end, pointerId: 1 })
      expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(expected)
    },
  )

  it('ignores dragging that starts on content and secondary pointers', () => {
    renderPanel()

    const handle = screen.getByRole('slider')

    fireEvent.pointerDown(screen.getByRole('button'), {
      clientY: 500,
    })

    fireEvent.pointerMove(handle, {
      clientY: 100,
    })

    expect(handle).toHaveAttribute('aria-valuenow', '318')

    fireEvent.pointerDown(handle, {
      clientY: 500,
      isPrimary: false,
    })

    fireEvent.pointerMove(handle, {
      clientY: 100,
    })

    expect(handle).toHaveAttribute('aria-valuenow', '318')
  })

  it.each(['pointerCancel', 'lostPointerCapture'] as const)(
    'cancels %s without committing a new height',
    (event) => {
      const onHeightChange = vi.fn()

      render(
        <DragPanel
          height={318}
          normalHeight={318}
          maxHeight={682}
          onHeightChange={onHeightChange}
          aria-label="Results"
          handleLabel="Panel height"
        >
          Content
        </DragPanel>,
      )

      const handle = screen.getByRole('slider')

      fireEvent.pointerDown(handle, {
        clientY: 500,
      })

      fireEvent.pointerMove(handle, {
        clientY: 100,
      })

      fireEvent[event](handle)
      fireEvent.pointerUp(handle, { clientY: 100 })

      expect(handle).toHaveAttribute('aria-valuenow', '318')
      expect(onHeightChange).not.toHaveBeenCalled()
    },
  )

  it('restores the list scroll position after collapse', () => {
    const props = {
      normalHeight: 318,
      maxHeight: 682,
      onHeightChange: vi.fn(),
      'aria-label': 'Results',
      handleLabel: 'Panel height',
    }

    const { rerender } = render(
      <DragPanel {...props} height={318}>
        <p>Row</p>
      </DragPanel>,
    )

    const list = screen.getByText('Row').parentElement!

    fireEvent.scroll(list, {
      target: { scrollTop: 120 },
    })

    rerender(
      <DragPanel {...props} height={30}>
        <p>Row</p>
      </DragPanel>,
    )

    fireEvent.scroll(list, {
      target: { scrollTop: 0 },
    })

    rerender(
      <DragPanel {...props} height={318}>
        <p>Row</p>
      </DragPanel>,
    )

    expect(list.scrollTop).toBe(120)
  })
})
