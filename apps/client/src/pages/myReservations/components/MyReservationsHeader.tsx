import { cn } from '@/shared/utils'

type MyReservationsHeaderProps = {
  userName: string
  className?: string
}

export const MyReservationsHeader = ({
  userName,
  className,
}: MyReservationsHeaderProps) => {
  return (
    <header className={cn('w-full pb-3', className)}>
      <h1 className="typo-header-1 text-cool-gray-900">
        {userName}님의 예약 정보
      </h1>
    </header>
  )
}
