import { Button } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  children?: ReactNode
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  children,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
        className="w-full max-w-[26rem] rounded-lg bg-white p-6 shadow-2xl"
      >
        <h2 id="admin-confirm-title" className="text-lg font-bold">
          {title}
        </h2>
        <p
          id="admin-confirm-description"
          className="text-cool-gray-500 mt-2 text-sm leading-6"
        >
          {description}
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button size="sm" variant="neutral" onClick={onCancel}>
            취소
          </Button>
          <Button size="sm" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  )
}
