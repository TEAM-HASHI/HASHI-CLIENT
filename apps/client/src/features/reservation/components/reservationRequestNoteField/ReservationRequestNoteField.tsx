import { Textarea } from '@hashi/hds-ui'
import type { ChangeEvent } from 'react'
import { useId } from 'react'

export const RESERVATION_REQUEST_NOTE_MAX_LENGTH = 1_000

interface ReservationRequestNoteFieldProps {
  value: string
  onValueChange: (value: string) => void
}

export const ReservationRequestNoteField = ({
  value,
  onValueChange,
}: ReservationRequestNoteFieldProps) => {
  const generatedId = useId()

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange(event.currentTarget.value)
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      <label className="typo-sub-header-1 text-black" htmlFor={generatedId}>
        요청사항 (선택)
      </label>
      <Textarea
        id={generatedId}
        maxLength={RESERVATION_REQUEST_NOTE_MAX_LENGTH}
        name="requestNote"
        onChange={handleChange}
        placeholder="요청사항을 작성해주세요."
        textareaClassName="min-h-[140px] focus-visible:border-black focus-visible:outline-0"
        value={value}
      />
    </div>
  )
}
