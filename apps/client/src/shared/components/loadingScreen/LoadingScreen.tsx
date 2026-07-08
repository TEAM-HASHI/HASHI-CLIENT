import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import chopsticksImage from '@/shared/assets/images/graphic_chopsticks.webp'
import loadingImage from '@/shared/assets/images/loading.gif'
import { cn } from '@/shared/utils'

export interface LoadingScreenProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> {
  message?: ReactNode
}

export const LoadingScreen = ({
  message = '로딩 중이에요',
  className,
  ...props
}: LoadingScreenProps) => {
  return (
    <div
      aria-busy="true"
      className={cn(
        'flex min-h-dvh flex-col items-center justify-center bg-white px-5 text-center',
        className,
      )}
      {...props}
    >
      <div className="flex -translate-y-4 flex-col items-center">
        <img
          alt=""
          aria-hidden="true"
          className="h-auto w-54 shrink-0 object-contain"
          src={loadingImage}
        />
        <img
          alt=""
          aria-hidden="true"
          className="mt-7 h-auto w-32 shrink-0 object-contain"
          src={chopsticksImage}
        />
        <p
          className="typo-body-1 text-cool-gray-900 mt-8"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </div>
    </div>
  )
}
