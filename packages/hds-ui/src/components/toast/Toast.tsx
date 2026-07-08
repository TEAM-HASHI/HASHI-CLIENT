import type { ReactNode } from 'react'
import {
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as AriaToastContent,
  UNSTABLE_ToastQueue as AriaToastQueue,
  UNSTABLE_ToastRegion as AriaToastRegion,
  type ToastProps as AriaToastProps,
  type ToastRegionProps as AriaToastRegionProps,
} from 'react-aria-components/Toast'

import { cn } from '../../utils'

export type ToastContent = {
  icon?: ReactNode
  children: ReactNode
}

export type ToastProps = Omit<
  AriaToastProps<ToastContent>,
  'children' | 'className'
> & {
  className?: string
}

export type ToastRegionProps = Omit<
  AriaToastRegionProps<ToastContent>,
  'children' | 'className' | 'queue'
> & {
  className?: string
  queue?: AriaToastRegionProps<ToastContent>['queue']
}

export const createToastQueue = () =>
  new AriaToastQueue<ToastContent>({
    maxVisibleToasts: 1,
  })

export const toastQueue = createToastQueue()

export const Toast = ({ className, ...props }: ToastProps) => {
  const { icon, children } = props.toast.content

  return (
    <AriaToast
      {...props}
      className={cn(
        'flex h-15 w-full items-center gap-2.75 px-5',
        'bg-primary-200 rounded-[10px] text-white',
        className,
      )}
    >
      <AriaToastContent className="contents">
        {icon ? (
          <span aria-hidden="true" className="flex size-6 shrink-0">
            {icon}
          </span>
        ) : null}
        <span className="typo-long-body-1 line-clamp-2 min-w-0">
          {children}
        </span>
      </AriaToastContent>
    </AriaToast>
  )
}

export const ToastRegion = ({
  queue = toastQueue,
  className,
  ...props
}: ToastRegionProps) => {
  return (
    <AriaToastRegion
      {...props}
      className={cn('flex w-full flex-col gap-2 outline-none', className)}
      queue={queue}
    >
      {({ toast }) => <Toast toast={toast} />}
    </AriaToastRegion>
  )
}
