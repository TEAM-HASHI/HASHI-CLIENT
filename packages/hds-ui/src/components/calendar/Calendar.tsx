import { BackIcon, NextIcon } from '@hashi/hds-icons'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../utils'

export type CalendarProps = Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'onChange'
> & {
  month: Date
  selectedDate?: Date
  disabledDates?: Date[]
  isDateDisabled?: (date: Date) => boolean
  minMonth?: Date
  onDateSelect?: (date: Date) => void
  onMonthChange?: (nextMonth: Date) => void
  formatYearLabel?: (month: Date) => string
  formatMonthLabel?: (month: Date) => string
  getDateAriaLabel?: (date: Date) => string
}

const createMonthDate = (date: Date, day = 1) => {
  return new Date(date.getFullYear(), date.getMonth(), day)
}

const createAdjacentMonth = (date: Date, offset: number) => {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

const checkIsSameDay = (date: Date, targetDate: Date) => {
  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  )
}

const getMonthDays = (month: Date) => {
  const visibleMonth = createMonthDate(month)
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate()

  return Array.from({ length: daysInMonth }, (_, index) =>
    createMonthDate(visibleMonth, index + 1),
  )
}

const defaultFormatMonthLabel = (month: Date) => {
  return `${month.getMonth() + 1}월`
}

const defaultFormatYearLabel = (month: Date) => {
  return String(month.getFullYear())
}

const defaultGetDateAriaLabel = (date: Date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

export const Calendar = ({
  month,
  selectedDate,
  disabledDates = [],
  isDateDisabled,
  minMonth,
  onDateSelect,
  onMonthChange,
  formatYearLabel = defaultFormatYearLabel,
  formatMonthLabel = defaultFormatMonthLabel,
  getDateAriaLabel = defaultGetDateAriaLabel,
  className,
  'aria-label': ariaLabel = '달력',
  ...props
}: CalendarProps) => {
  const visibleMonth = createMonthDate(month)
  const minimumMonth = minMonth ? createMonthDate(minMonth) : undefined
  const monthDays = getMonthDays(visibleMonth)
  const firstWeekday = visibleMonth.getDay()
  const isPreviousMonthDisabled =
    onMonthChange === undefined ||
    (minimumMonth !== undefined && visibleMonth <= minimumMonth)

  const checkIsDateDisabled = (date: Date) => {
    return (
      disabledDates.some((disabledDate) =>
        checkIsSameDay(date, disabledDate),
      ) || Boolean(isDateDisabled?.(date))
    )
  }

  return (
    <section
      aria-label={ariaLabel}
      className={cn('w-full font-sans', className)}
      {...props}
    >
      <div className="mb-6.5 flex h-11 items-center justify-between">
        <button
          aria-label="이전 달"
          className="text-cool-gray-900 focus-visible:outline-cool-gray-900 disabled:text-cool-gray-400 flex size-6 appearance-none items-center justify-center rounded-[5px] border-0 bg-transparent p-0 text-[24px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
          disabled={isPreviousMonthDisabled}
          onClick={() => onMonthChange?.(createAdjacentMonth(visibleMonth, -1))}
          type="button"
        >
          <BackIcon aria-hidden="true" />
        </button>
        <h2 className="flex w-10 flex-col items-center justify-center gap-0.5 text-center">
          <span className="typo-body-3 text-cool-gray-900">
            {formatYearLabel(visibleMonth)}
          </span>
          <span className="typo-sub-header-1 text-black">
            {formatMonthLabel(visibleMonth)}
          </span>
        </h2>
        <button
          aria-label="다음 달"
          className="text-cool-gray-900 focus-visible:outline-cool-gray-900 disabled:text-cool-gray-400 flex size-6 appearance-none items-center justify-center rounded-[5px] border-0 bg-transparent p-0 text-[24px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
          disabled={onMonthChange === undefined}
          onClick={() => onMonthChange?.(createAdjacentMonth(visibleMonth, 1))}
          type="button"
        >
          <NextIcon aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-[repeat(7,auto)] justify-between gap-y-1.5">
        {Array.from({ length: firstWeekday }, (_, index) => (
          <span aria-hidden="true" key={`empty-${index}`} />
        ))}
        {monthDays.map((date) => {
          const isDisabled = checkIsDateDisabled(date)
          const isSelected =
            selectedDate !== undefined &&
            !isDisabled &&
            checkIsSameDay(date, selectedDate)

          return (
            <div
              className="flex size-9 items-center justify-center"
              key={date.getTime()}
            >
              <button
                aria-label={getDateAriaLabel(date)}
                aria-pressed={isSelected}
                className={cn(
                  'typo-body-4 focus-visible:outline-cool-gray-900 disabled:text-cool-gray-400 flex w-8.5 shrink-0 appearance-none items-center justify-center rounded-[5px] border-0 bg-transparent px-1.5 py-1.25 text-black focus-visible:outline-2 focus-visible:outline-offset-2',
                  isSelected &&
                    'typo-sub-header-2 size-9 bg-black px-1.75 py-1 text-white',
                )}
                disabled={isDisabled}
                onClick={() => onDateSelect?.(date)}
                type="button"
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
