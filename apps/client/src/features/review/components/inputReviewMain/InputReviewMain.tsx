import { Textarea } from '@hashi/hds-ui'
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react'
import { useId, useState } from 'react'

import {
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from '@/features/review/constants'
import { getReviewTextHelperText } from '@/features/review/utils'
import { cn } from '@/shared/utils'

import { ReviewPhotoUploader } from '@/features/review/components/inputReviewMain/ReviewPhotoUploader'
import { useReviewPhotoUploader } from '@/features/review/components/inputReviewMain/useReviewPhotoUploader'

export interface InputReviewMainProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children' | 'onChange'
> {
  value?: string
  photoFiles?: File[]
  onValueChange?: (value: string) => void
  onPhotoFilesChange?: (files: File[]) => void
  maxLength?: number
  disabled?: boolean
}

const EMPTY_PHOTO_FILES: File[] = []

export const InputReviewMain = ({
  value = '',
  photoFiles = EMPTY_PHOTO_FILES,
  onValueChange,
  onPhotoFilesChange,
  maxLength = REVIEW_TEXT_MAX_LENGTH,
  disabled = false,
  className,
  ...props
}: InputReviewMainProps) => {
  const photoInputId = useId()
  const helperTextId = useId()
  const counterId = useId()
  const [hasReviewTextBlurred, setHasReviewTextBlurred] = useState(false)
  const {
    hasReachedMaxPhotoCount,
    hasSelectedPhotoFiles,
    photoErrorMessage,
    photoInputRef,
    photoPreviewItems,
    handlePhotoDeleteClick,
    handlePhotoInputChange,
    openPhotoFileDialog,
  } = useReviewPhotoUploader({
    disabled,
    onPhotoFilesChange,
    photoFiles,
  })
  const reviewTextLength = value.length
  const hasStartedValidation = hasReviewTextBlurred || reviewTextLength > 0
  const hasInvalidReviewLength =
    hasStartedValidation &&
    (reviewTextLength < REVIEW_TEXT_MIN_LENGTH || reviewTextLength > maxLength)
  const hasExceededMaxLength = reviewTextLength > maxLength
  const helperText = getReviewTextHelperText(
    reviewTextLength,
    maxLength,
    hasStartedValidation,
  )

  const handleReviewTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(event.currentTarget.value)
  }

  return (
    <section
      {...props}
      className={cn(
        'flex w-full min-w-0 flex-col items-start gap-5 px-5 py-7',
        className,
      )}
    >
      <div className="flex w-full flex-col items-start gap-1 break-words">
        <p className="typo-sub-header-1 text-primary-200 w-full">
          리뷰를 작성해주세요.
        </p>
        <p className="typo-body-7 text-cool-gray-600 w-full">
          (첨부 사진 장당 5MB, 최대 10장)
        </p>
      </div>
      <div className="flex w-full max-w-full min-w-0 flex-col gap-5 overflow-x-hidden">
        <ReviewPhotoUploader
          disabled={disabled}
          hasReachedMaxPhotoCount={hasReachedMaxPhotoCount}
          hasSelectedPhotoFiles={hasSelectedPhotoFiles}
          photoErrorMessage={photoErrorMessage}
          photoInputId={photoInputId}
          photoInputRef={photoInputRef}
          photoPreviewItems={photoPreviewItems}
          onPhotoDeleteClick={handlePhotoDeleteClick}
          onPhotoInputChange={handlePhotoInputChange}
          onPhotoTriggerClick={openPhotoFileDialog}
        />
        <div className="flex w-full flex-col gap-2">
          <Textarea
            aria-describedby={`${helperTextId} ${counterId}`}
            aria-label="리뷰 내용"
            disabled={disabled}
            maxLength={maxLength}
            placeholder="리뷰를 작성해 주세요."
            showCounter={false}
            textareaClassName="typo-long-body-1 focus-visible:border-warm-gray-100 focus-visible:outline-none"
            value={value}
            onBlur={() => setHasReviewTextBlurred(true)}
            onChange={handleReviewTextChange}
          />
          <div className="typo-body-6 flex w-full items-center justify-between gap-3 font-sans leading-[1.36] whitespace-nowrap">
            <p
              id={helperTextId}
              className={cn(
                'min-w-0 truncate',
                hasInvalidReviewLength
                  ? 'text-primary-400'
                  : 'text-warm-gray-300',
              )}
            >
              {helperText}
            </p>
            <p
              id={counterId}
              aria-live="polite"
              className="flex shrink-0 items-end gap-[2px]"
            >
              <span
                className={cn(
                  hasExceededMaxLength
                    ? 'text-primary-400'
                    : 'text-primary-200',
                )}
              >
                {reviewTextLength}
              </span>
              <span className="text-warm-gray-300">/{maxLength}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
