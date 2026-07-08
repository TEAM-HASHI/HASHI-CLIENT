import { CameraIcon, CloseSmallIcon } from '@hashi/hds-icons'
import type { ChangeEvent, RefObject } from 'react'

import { cn } from '@/shared/utils'

type PhotoPreviewItem = {
  id: string
  name: string
  src: string
}

type ReviewPhotoUploaderProps = {
  disabled: boolean
  hasReachedMaxPhotoCount: boolean
  hasSelectedPhotoFiles: boolean
  photoErrorMessage: string
  photoInputId: string
  photoInputRef: RefObject<HTMLInputElement | null>
  photoPreviewItems: PhotoPreviewItem[]
  onPhotoDeleteClick: (deleteIndex: number) => void
  onPhotoInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPhotoTriggerClick: () => void
}

const photoTriggerClassName = cn(
  'border-warm-gray-100 text-warm-gray-300 focus-visible:outline-cool-gray-500',
  'flex h-[130px] w-full max-w-full flex-col items-center justify-center gap-2 rounded-[10px] border bg-white px-5 py-10',
  'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40',
)

const photoTriggerContent = (
  <>
    <CameraIcon aria-hidden="true" className="size-6 shrink-0 opacity-50" />
    <span className="typo-body-4 whitespace-nowrap">
      사진을 첨부해 주세요. (선택)
    </span>
  </>
)

export const ReviewPhotoUploader = ({
  disabled,
  hasReachedMaxPhotoCount,
  hasSelectedPhotoFiles,
  photoErrorMessage,
  photoInputId,
  photoInputRef,
  photoPreviewItems,
  onPhotoDeleteClick,
  onPhotoInputChange,
  onPhotoTriggerClick,
}: ReviewPhotoUploaderProps) => {
  const isPhotoInputDisabled = disabled || hasReachedMaxPhotoCount

  return (
    <>
      {hasSelectedPhotoFiles ? (
        <ul
          aria-label="선택된 리뷰 사진 목록"
          className="flex w-full max-w-full min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <li className="shrink-0">
            <button
              aria-controls={photoInputId}
              aria-label="사진을 첨부해 주세요. (선택)"
              className="border-warm-gray-100 text-warm-gray-300 focus-visible:outline-cool-gray-500 flex size-[130px] flex-col items-center justify-center gap-2 rounded-[10px] border bg-white px-5 py-10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isPhotoInputDisabled}
              type="button"
              onClick={onPhotoTriggerClick}
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
                onClick={() => onPhotoDeleteClick(index)}
              >
                <CloseSmallIcon aria-hidden="true" className="size-[18px]" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <button
          aria-controls={photoInputId}
          className={photoTriggerClassName}
          disabled={isPhotoInputDisabled}
          type="button"
          onClick={onPhotoTriggerClick}
        >
          {photoTriggerContent}
        </button>
      )}
      <input
        ref={photoInputRef}
        id={photoInputId}
        accept="image/*"
        aria-label="리뷰 사진 첨부"
        className="sr-only"
        disabled={isPhotoInputDisabled}
        multiple
        type="file"
        onChange={onPhotoInputChange}
      />
      {photoErrorMessage ? (
        <p
          aria-live="polite"
          className="typo-body-6 text-primary-400 w-full break-words"
        >
          {photoErrorMessage}
        </p>
      ) : null}
    </>
  )
}
