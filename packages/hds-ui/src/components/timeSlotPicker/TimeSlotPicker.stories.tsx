import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { TimeSlotPicker } from './TimeSlotPicker'
import type { TimeSlotPickerProps } from './TimeSlotPicker'

const TIME_SLOTS = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
]

const InteractivePicker = (args: TimeSlotPickerProps) => {
  const [{ selectedTime }, updateArgs] = useArgs<TimeSlotPickerProps>()

  const handleTimeSelect = (time: string) => {
    updateArgs({ selectedTime: time })
  }

  return (
    <TimeSlotPicker
      {...args}
      selectedTime={selectedTime}
      onTimeSelect={handleTimeSelect}
    />
  )
}

const pickerDecorator = (Story: () => ReactNode) => (
  <div className="w-full max-w-102.5 bg-white px-8 py-6">
    <Story />
  </div>
)

const meta = {
  title: 'Components/TimeSlotPicker',
  component: TimeSlotPicker,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [pickerDecorator],
  args: { timeSlots: TIME_SLOTS, disabled: false },
  argTypes: {
    timeSlots: { control: 'object' },
    selectedTime: { control: 'select', options: [undefined, ...TIME_SLOTS] },
    disabled: { control: 'boolean' },
    onTimeSelect: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof TimeSlotPicker>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { selectedTime: '11:00' } }
export const Disabled: Story = { args: { disabled: true } }
export const DisabledWithSelection: Story = {
  args: { disabled: true, selectedTime: '11:00' },
}
export const Interactive: Story = { render: InteractivePicker }
export const NarrowContainer: Story = {
  render: InteractivePicker,
  decorators: [
    (Story) => (
      <div className="w-64 max-w-full">
        <Story />
      </div>
    ),
  ],
}
export const LongText: Story = {
  args: {
    timeSlots: ['오전 11시 30분 (현지 시각)', '12:00', '12:30', '13:00'],
  },
}
export const PartialRow: Story = { args: { timeSlots: TIME_SLOTS.slice(0, 6) } }
export const Empty: Story = { args: { timeSlots: [] } }
