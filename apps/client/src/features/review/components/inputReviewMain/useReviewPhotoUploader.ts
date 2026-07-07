import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import {
  REVIEW_PHOTO_MAX_COUNT,
  REVIEW_PHOTO_MAX_COUNT_ERROR_MESSAGE,
  REVIEW_PHOTO_MAX_SIZE_BYTES,
  REVIEW_PHOTO_SIZE_ERROR_MESSAGE,
} from '@/features/review/constants'

type UseReviewPhotoUploaderParams = {
  disabled: boolean
  photoFiles: File[]
  onPhotoFilesChange?: (files: File[]) => void
}

export const useReviewPhotoUploader = ({
  disabled,
  photoFiles,
  onPhotoFilesChange,
}: UseReviewPhotoUploaderParams) => {
  const photoInputRef = useRef<HTMLInputElement>(null)
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
  const hasSelectedPhotoFiles = photoFiles.length > 0
  const hasReachedMaxPhotoCount = photoFiles.length >= REVIEW_PHOTO_MAX_COUNT

  const openPhotoFileDialog = () => {
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

  useEffect(() => {
    return () => {
      photoPreviewItems.forEach(({ src }) => URL.revokeObjectURL(src))
    }
  }, [photoPreviewItems])

  return {
    hasReachedMaxPhotoCount,
    hasSelectedPhotoFiles,
    photoErrorMessage,
    photoInputRef,
    photoPreviewItems,
    handlePhotoDeleteClick,
    handlePhotoInputChange,
    openPhotoFileDialog,
  }
}
