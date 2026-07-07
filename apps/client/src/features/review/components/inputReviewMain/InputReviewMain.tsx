import { CameraIcon, CloseSmallIcon } from '@hashi/hds-icons'
import { Textarea } from '@hashi/hds-ui'
import type { ChangeEvent, ComponentPropsWithoutRef, MouseEvent } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import {
  REVIEW_PHOTO_MAX_COUNT,
  REVIEW_PHOTO_MAX_COUNT_ERROR_MESSAGE,
  REVIEW_PHOTO_MAX_SIZE_BYTES,
  REVIEW_PHOTO_SIZE_ERROR_MESSAGE,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from '@/features/review/constants'
import { getReviewTextHelperText } from '@/features/review/utils'
import { cn } from '@/shared/utils'

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
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [isReviewTextFocused, setIsReviewTextFocused] = useState(false)
  const [photoErrorMessage, setPhotoErrorMessage] = useState('')
  const photoPreviewItems = useMemo(
    () =>
      photoFiles.map((photoFile, index) => ({
        id: `${photoFile.name}-${photoFile.lastModified}-${photoFile.size}-${index}`,
        name: photoFile.name,
        src: URL.createObjectURL(photoFile),
      })),
    [photoFiles],
  )
  const reviewTextLength = value.length
  const hasSelectedPhotoFiles = photoFiles.length > 0
  const hasReachedMaxPhotoCount = photoFiles.length >= REVIEW_PHOTO_MAX_COUNT
  const hasStartedValidation = isReviewTextFocused || reviewTextLength > 0
  const hasInvalidReviewLength =
    hasStartedValidation &&
    (reviewTextLength < REVIEW_TEXT_MIN_LENGTH || reviewTextLength > maxLength)
  const hasExceededMaxLength = reviewTextLength > maxLength
  const helperText = getReviewTextHelperText(
    reviewTextLength,
    maxLength,
    hasStartedValidation,
  )

  const handlePhotoButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (disabled || hasReachedMaxPhotoCount) {
      return
    }

    photoInputRef.current?.click()
  }

  const handlePhotoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhotoFiles = Array.from(event.currentTarget.files ?? [])
    const availablePhotoCount = Math.max(
      REVIEW_PHOTO_MAX_COUNT - photoFiles.length,
      0,
    )
    const validPhotoFiles = selectedPhotoFiles.filter(
      (selectedPhotoFile) =>
        selectedPhotoFile.size <= REVIEW_PHOTO_MAX_SIZE_BYTES,
    )
    const nextPhotoFiles = validPhotoFiles.slice(0, availablePhotoCount)
    const hasRejectedPhotoFilesBySize =
      validPhotoFiles.length !== selectedPhotoFiles.length
    const hasRejectedPhotoFilesByCount =
      validPhotoFiles.length > availablePhotoCount
    let nextPhotoErrorMessage = ''

    if (hasRejectedPhotoFilesBySize) {
      nextPhotoErrorMessage = REVIEW_PHOTO_SIZE_ERROR_MESSAGE
    } else if (hasRejectedPhotoFilesByCount) {
      nextPhotoErrorMessage = REVIEW_PHOTO_MAX_COUNT_ERROR_MESSAGE
    }

    setPhotoErrorMessage(nextPhotoErrorMessage)

    if (nextPhotoFiles.length > 0) {
      onPhotoFilesChange?.([...photoFiles, ...nextPhotoFiles])
    }

    event.currentTarget.value = ''
  }

  const handlePhotoDeleteClick = (deleteIndex: number) => {
    setPhotoErrorMessage('')
    onPhotoFilesChange?.(
      photoFiles.filter((_, photoFileIndex) => photoFileIndex !== deleteIndex),
    )
  }

  const handleReviewTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(event.currentTarget.value)
  }

  useEffect(() => {
    return () => {
      photoPreviewItems.forEach(({ src }) => URL.revokeObjectURL(src))
    }
  }, [photoPreviewItems])

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
        {hasSelectedPhotoFiles ? (
          <ul
            aria-label="선택된 리뷰 사진 목록"
            className="flex w-full max-w-full min-w-0 scrollbar-none gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <li className="shrink-0">
              <button
                aria-controls={photoInputId}
                aria-label="사진을 첨부해 주세요. (선택)"
                className="border-warm-gray-100 text-warm-gray-300 focus-visible:outline-cool-gray-500 flex size-[130px] flex-col items-center justify-center gap-2 rounded-[10px] border bg-white px-5 py-10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={disabled || hasReachedMaxPhotoCount}
                type="button"
                onClick={handlePhotoButtonClick}
              >
                <CameraIcon
                  aria-hidden="true"
                  className="size-6 shrink-0 opacity-50"
                />
                <span className="typo-body-4 whitespace-nowrap">사진 추가</span>
              </button>
            </li>
            {photoPreviewItems.map(({ id, name, src }, index) => (
              <li key={id} className="relative size-[130px] shrink-0">
                <img
                  src={src}
                  alt={`${name} 미리보기`}
                  className="border-warm-gray-100 size-full rounded-[10px] border object-cover"
                />
                <button
                  aria-label={`${name} 사진 삭제`}
                  className="text-cool-gray-900 focus-visible:outline-cool-gray-500 absolute top-1.5 right-1.5 flex size-[18px] items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={disabled}
                  type="button"
                  onClick={() => handlePhotoDeleteClick(index)}
                >
                  <CloseSmallIcon aria-hidden="true" className="size-[18px]" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <button
            aria-controls={photoInputId}
            className="border-warm-gray-100 text-warm-gray-300 focus-visible:outline-cool-gray-500 flex h-[130px] w-full max-w-full flex-col items-center justify-center gap-2 rounded-[10px] border bg-white px-5 py-10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={disabled || hasReachedMaxPhotoCount}
            type="button"
            onClick={handlePhotoButtonClick}
          >
            <CameraIcon
              aria-hidden="true"
              className="size-6 shrink-0 opacity-50"
            />
            <span className="typo-body-4 whitespace-nowrap">
              사진을 첨부해 주세요. (선택)
            </span>
          </button>
        )}
        <input
          ref={photoInputRef}
          id={photoInputId}
          accept="image/*"
          aria-label="리뷰 사진 첨부"
          className="sr-only"
          disabled={disabled || hasReachedMaxPhotoCount}
          multiple
          type="file"
          onChange={handlePhotoInputChange}
        />
        {photoErrorMessage && (
          <p
            aria-live="polite"
            className="typo-body-6 text-primary-400 w-full break-words"
          >
            {photoErrorMessage}
          </p>
        )}
        <div className="flex w-full flex-col gap-2">
          <Textarea
            aria-describedby={`${helperTextId} ${counterId}`}
            aria-label="리뷰 내용"
            disabled={disabled}
            maxLength={maxLength}
            placeholder="리뷰를 작성해 주세요."
            showCounter={false}
            textareaClassName="typo-long-body-1"
            value={value}
            onBlur={() => setIsReviewTextFocused(false)}
            onChange={handleReviewTextChange}
            onFocus={() => setIsReviewTextFocused(true)}
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
