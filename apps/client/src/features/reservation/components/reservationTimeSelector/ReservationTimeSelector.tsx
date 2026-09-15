import { TimeSlotPicker } from '@hashi/hds-ui'

interface ReservationTimeSelectorProps {
  timeSlots: readonly string[]
  selectedTime?: string
  disabled?: boolean
  onTimeSelect: (time: string) => void
}

export const ReservationTimeSelector = ({
  timeSlots,
  selectedTime,
  disabled = false,
  onTimeSelect,
}: ReservationTimeSelectorProps) => {
  return (
    <TimeSlotPicker
      disabled={disabled}
      onTimeSelect={onTimeSelect}
      selectedTime={selectedTime}
      timeSlots={timeSlots}
    />
  )
}
