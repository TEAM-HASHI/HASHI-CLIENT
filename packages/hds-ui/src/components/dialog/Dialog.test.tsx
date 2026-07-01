import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Dialog } from './Dialog'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

const renderDialog = ({
  type = 'dialog',
  open,
  onOpenChange,
  defaultOpen,
}: {
  type?: 'dialog' | 'alertdialog'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
} = {}) => {
  return render(
    <Dialog.Root
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
      type={type}
    >
      <Dialog.Trigger>열기</Dialog.Trigger>
      <Dialog.Content data-testid="content">
        <Dialog.Header data-testid="header">
          <Dialog.Icon>
            <span aria-hidden="true">!</span>
          </Dialog.Icon>
          <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>
          <Dialog.Description>
            삭제한 리뷰는 다시 되돌릴 수 없어요.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body data-testid="body">본문</Dialog.Body>
        <Dialog.Footer data-testid="footer">
          <Dialog.Close>취소하기</Dialog.Close>
          <button type="button">삭제하기</button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>,
  )
}

describe('Dialog', () => {
  const getOverlay = () => {
    const overlay = document.querySelector('[data-hds-dialog-overlay]')

    if (!overlay) {
      throw new Error('Dialog overlay not found')
    }

    return overlay
  }

  const dismissByOutsideInteraction = () => {
    const overlay = getOverlay()

    fireEvent.mouseDown(overlay)
    fireEvent.mouseUp(overlay)
    fireEvent.click(overlay)
  }

  it('renders content through a portal only when open', () => {
    renderDialog()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '열기' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('supports controlled open state and calls onOpenChange', () => {
    const handleOpenChange = vi.fn()

    renderDialog({ onOpenChange: handleOpenChange, open: false })

    fireEvent.click(screen.getByRole('button', { name: '열기' }))

    expect(handleOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from React Aria press events on trigger', () => {
    const handlePress = vi.fn()

    render(
      <Dialog.Root>
        <Dialog.Trigger onPress={handlePress}>열기</Dialog.Trigger>
        <Dialog.Content aria-label="Press dialog">내용</Dialog.Content>
      </Dialog.Root>,
    )

    fireEvent.click(screen.getByRole('button', { name: '열기' }))

    expect(handlePress).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes from React Aria press events on close', () => {
    const handlePress = vi.fn()

    render(
      <Dialog.Root defaultOpen>
        <Dialog.Trigger>열기</Dialog.Trigger>
        <Dialog.Content aria-label="Press dialog">
          <Dialog.Close onPress={handlePress}>닫기</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    )

    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(handlePress).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps onClick compatibility for trigger and close buttons', () => {
    const handleTriggerClick = vi.fn()
    const handleCloseClick = vi.fn()

    render(
      <Dialog.Root>
        <Dialog.Trigger onClick={handleTriggerClick}>열기</Dialog.Trigger>
        <Dialog.Content aria-label="Click dialog">
          <Dialog.Close onClick={handleCloseClick}>닫기</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    )

    fireEvent.click(screen.getByRole('button', { name: '열기' }))

    expect(handleTriggerClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(handleCloseClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('supports uncontrolled defaultOpen state', () => {
    renderDialog({ defaultOpen: true })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('uses button semantics for trigger and close', () => {
    renderDialog()

    expect(screen.getByRole('button', { name: '열기' })).toHaveAttribute(
      'type',
      'button',
    )

    fireEvent.click(screen.getByRole('button', { name: '열기' }))

    expect(screen.getByRole('button', { name: '취소하기' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('closes when Dialog.Close is clicked', () => {
    renderDialog({ defaultOpen: true })

    fireEvent.click(screen.getByRole('button', { name: '취소하기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('connects title and description with aria attributes', () => {
    renderDialog({ defaultOpen: true })

    const dialog = screen.getByRole('dialog')
    const titleId = dialog.getAttribute('aria-labelledby')
    const descriptionId = dialog.getAttribute('aria-describedby')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(titleId).toBeTruthy()
    expect(descriptionId).toBeTruthy()
    expect(document.getElementById(titleId ?? '')).toHaveTextContent(
      '정말 삭제하시겠습니까?',
    )
    expect(document.getElementById(descriptionId ?? '')).toHaveTextContent(
      '삭제한 리뷰는 다시 되돌릴 수 없어요.',
    )
  })

  it('closes a dialog with Escape', () => {
    renderDialog({ defaultOpen: true })

    fireEvent.keyDown(screen.getByRole('button', { name: '취소하기' }), {
      key: 'Escape',
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes a dialog when outside interaction is dismissed', () => {
    renderDialog({ defaultOpen: true })

    dismissByOutsideInteraction()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onOpenChange once when dismissed by outside interaction', () => {
    const handleOpenChange = vi.fn()

    renderDialog({ defaultOpen: true, onOpenChange: handleOpenChange })

    dismissByOutsideInteraction()

    expect(handleOpenChange).toHaveBeenCalledTimes(1)
    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not close an alertdialog with outside interaction', () => {
    renderDialog({ defaultOpen: true, type: 'alertdialog' })

    dismissByOutsideInteraction()

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('moves focus into the dialog on open and returns focus to trigger on close', () => {
    renderDialog()

    const trigger = screen.getByRole('button', { name: '열기' })
    trigger.focus()
    fireEvent.click(trigger)

    expect(screen.getByRole('button', { name: '취소하기' })).toHaveFocus()

    fireEvent.click(screen.getByRole('button', { name: '취소하기' }))

    expect(trigger).toHaveFocus()
  })

  it('keeps Tab focus inside the dialog', () => {
    renderDialog({ defaultOpen: true })

    const closeButton = screen.getByRole('button', { name: '취소하기' })
    const deleteButton = screen.getByRole('button', { name: '삭제하기' })

    closeButton.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(deleteButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
  })

  it('merges className into content and slots', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content className="custom-content">
          <Dialog.Header className="custom-header">
            <Dialog.Title>제목</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body className="custom-body">본문</Dialog.Body>
          <Dialog.Footer className="custom-footer">푸터</Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>,
    )

    expect(screen.getByRole('dialog')).toHaveClass('custom-content')
    expect(screen.getByText('제목').parentElement).toHaveClass('custom-header')
    expect(screen.getByText('본문')).toHaveClass('custom-body')
    expect(screen.getByText('푸터')).toHaveClass('custom-footer')
  })
})
