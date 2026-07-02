import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'

import { Calendar } from './Calendar'

const JUNE_2026 = new Date(2026, 5, 1)

const calendarDecorator = (Story: () => ReactNode) => (
  <div className="w-[393px] max-w-full bg-white px-8 py-6">
    <Story />
  </div>
)

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  args: {
    month: JUNE_2026,
  },
  argTypes: {
    formatMonthLabel: {
      control: false,
    },
    isDateDisabled: {
      control: false,
    },
    onDateSelect: {
      action: 'date selected',
    },
    onMonthChange: {
      action: 'month changed',
    },
    selectedDate: {
      control: false,
    },
    disabledDates: {
      control: false,
    },
    weekdayLabels: {
      control: false,
    },
  },
  decorators: [calendarDecorator],
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SelectedDate: Story = {
  args: {
    selectedDate: new Date(2026, 5, 1),
  },
}

export const DisabledDates: Story = {
  args: {
    disabledDates: [
      new Date(2026, 5, 6),
      new Date(2026, 5, 13),
      new Date(2026, 5, 20),
      new Date(2026, 5, 27),
    ],
  },
}

export const SelectedAndDisabled: Story = {
  args: {
    selectedDate: new Date(2026, 5, 1),
    disabledDates: [
      new Date(2026, 5, 6),
      new Date(2026, 5, 13),
      new Date(2026, 5, 20),
      new Date(2026, 5, 27),
    ],
  },
}

export const MonthNavigation: Story = {
  render: (args) => {
    const [month, setMonth] = useState<Date>(args.month ?? JUNE_2026)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      args.selectedDate,
    )

    return (
      <Calendar
        {...args}
        month={month}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onMonthChange={setMonth}
      />
    )
  },
}

export const CustomLabels: Story = {
  args: {
    formatMonthLabel: (month) =>
      `${month.getFullYear()}.${String(month.getMonth() + 1).padStart(2, '0')}`,
    weekdayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
}

export const DisabledByRule: Story = {
  args: {
    isDateDisabled: (date) => date.getDay() === 1,
  },
}

export const LabelledRegion: Story = {
  args: {
    'aria-label': '예약 가능한 날짜를 선택하는 달력',
    selectedDate: new Date(2026, 5, 7),
  },
}
