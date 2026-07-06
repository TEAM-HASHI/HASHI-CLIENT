import { Button } from '@hashi/hds-ui'
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/utils'

export interface ReviewSubmitBarProps extends Omit<
  ComponentPropsWithoutRef<'footer'>,
  'children' | 'onSubmit'
> {
  disabled?: boolean
  loading?: boolean
  onSubmit?: () => void
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
}

export const ReviewSubmitBar = ({
  disabled = false,
  loading = false,
  onSubmit,
  type = 'button',
  className,
  'aria-label': ariaLabel = '리뷰 저장 액션',
  ...props
}: ReviewSubmitBarProps) => {
  return (
    <footer
      {...props}
      aria-label={ariaLabel}
      className={cn('flex w-full justify-center px-5 pt-[17px]', className)}
    >
      <Button
        className="max-w-[353px]"
        disabled={disabled}
        loading={loading}
        size="lg"
        type={type}
        width="full"
        onClick={onSubmit}
      >
        저장하기
      </Button>
    </footer>
  )
}
