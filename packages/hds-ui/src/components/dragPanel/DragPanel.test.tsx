import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DragPanel } from './DragPanel'

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
  it('keeps the panel above the visible viewport bottom', () => {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(500)

    renderPanel(794)

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '500')
    expect(screen.getByRole('region')).toHaveStyle({ bottom: '200px' })
  })

  it('applies snap transition while not actively dragging', () => {
    renderPanel()

    expect(screen.getByRole('region', { name: 'Results' })).toHaveClass(
      'transition-[height]',
      'duration-[380ms]',
      'ease-[cubic-bezier(0.22,1,0.36,1)]',
    )
  })

  it('disables snap transition while actively dragging', () => {
    renderPanel()

    const handle = screen.getByRole('slider')
    const panel = screen.getByRole('region', { name: 'Results' })

    fireEvent.pointerDown(handle, {
      clientY: 500,
      pointerId: 1,
    })

    expect(panel).not.toHaveClass('transition-[height]')
  })

  it('moves focus out of content when the caller collapses the panel', () => {
    const props = {
      normalHeight: 318,
      maxHeight: 682,
      onHeightChange: vi.fn(),
      'aria-label': 'Results',
      handleLabel: 'Panel height',
    }

    const { rerender } = render(
      <DragPanel {...props} height={318}>
        <button>Item</button>
      </DragPanel>,
    )

    screen.getByRole('button').focus()

    rerender(
      <DragPanel {...props} height={30}>
        <button>Item</button>
      </DragPanel>,
    )

    expect(screen.getByRole('slider')).toHaveFocus()
  })

  it('does not lock the background or render a modal', () => {
    renderPanel()

    expect(screen.getByRole('region', { name: 'Results' })).not.toHaveAttribute(
      'aria-modal',
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('uses the same entrance motion as BottomSheet', () => {
    renderPanel()

    expect(screen.getByRole('region', { name: 'Results' })).toHaveClass(
      'animate-bottom-sheet-panel-in',
    )
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

  it('requests keyboard height changes without trapping Tab or closing on Escape', () => {
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

    fireEvent.keyDown(handle, { key: 'End' })
    expect(onHeightChange).toHaveBeenLastCalledWith(682)

    fireEvent.keyDown(handle, { key: 'Home' })
    expect(onHeightChange).toHaveBeenLastCalledWith(30)

    onHeightChange.mockClear()

    fireEvent.keyDown(handle, { key: 'Tab' })
    fireEvent.keyDown(handle, { key: 'Escape' })

    expect(onHeightChange).not.toHaveBeenCalled()
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

  it('moves up one stage when dragged upward beyond the dead zone', () => {
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
      pointerId: 1,
    })

    fireEvent.pointerUp(handle, {
      clientY: 480,
      pointerId: 1,
    })

    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(682)
  })

  it('moves down one stage when dragged downward beyond the dead zone', () => {
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
      clientY: 300,
      pointerId: 1,
    })

    fireEvent.pointerUp(handle, {
      clientY: 320,
      pointerId: 1,
    })

    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(30)
  })

  it('keeps the current stage when movement stays inside the dead zone', () => {
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
      pointerId: 1,
    })

    fireEvent.pointerUp(handle, {
      clientY: 495,
      pointerId: 1,
    })

    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(318)
  })

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

  it('cancels interrupted gestures without committing a new height', () => {
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

    fireEvent.pointerCancel(handle)

    expect(handle).toHaveAttribute('aria-valuenow', '318')
    expect(onHeightChange).not.toHaveBeenCalled()
  })

  it('moves between available stages with arrow keys', () => {
    const onHeightChange = vi.fn()

    render(
      <DragPanel
        height={30}
        normalHeight={318}
        maxHeight={682}
        onHeightChange={onHeightChange}
        aria-label="Results"
        handleLabel="Panel height"
      >
        Content
      </DragPanel>,
    )

    fireEvent.keyDown(screen.getByRole('slider'), {
      key: 'ArrowUp',
    })

    expect(onHeightChange).toHaveBeenLastCalledWith(318)
  })

  it('moves across two stages when drag passes the intermediate stage', () => {
    const onHeightChange = vi.fn()

    render(
      <DragPanel
        height={30}
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
      clientY: 700,
      pointerId: 1,
    })

    fireEvent.pointerMove(handle, {
      clientY: 300,
      pointerId: 1,
    })

    fireEvent.pointerUp(handle, {
      clientY: 300,
      pointerId: 1,
    })

    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(682)
  })

  it('moves down across two stages when drag passes the intermediate stage', () => {
    const onHeightChange = vi.fn()

    render(
      <DragPanel
        height={682}
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
      clientY: 200,
      pointerId: 1,
    })

    fireEvent.pointerMove(handle, {
      clientY: 600,
      pointerId: 1,
    })

    fireEvent.pointerUp(handle, {
      clientY: 600,
      pointerId: 1,
    })

    expect(onHeightChange).toHaveBeenCalledExactlyOnceWith(30)
  })

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
