import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import {
  REVIEW_PHOTO_MAX_COUNT,
  REVIEW_PHOTO_MAX_COUNT_ERROR_MESSAGE,
  REVIEW_PHOTO_MAX_SIZE_BYTES,
  REVIEW_PHOTO_SIZE_ERROR_MESSAGE,
  REVIEW_PHOTO_TYPE_ERROR_MESSAGE,
} from '@/features/review/constants'
import { checkIsSupportedReviewPhotoFile } from '@/features/review/utils'

type UseReviewPhotoUploaderParams = {
  disabled: boolean
  photoFiles: File[]
  photoUrls: string[]
  onPhotoFilesChange?: (files: File[]) => void
  onPhotoUrlsChange?: (urls: string[]) => void
}

type PhotoPreviewItem = {
  id: string
  name: string
  src: string
  shouldRevokeSrc: boolean
}

export const useReviewPhotoUploader = ({
  disabled,
  photoFiles,
  photoUrls,
  onPhotoFilesChange,
  onPhotoUrlsChange,
}: UseReviewPhotoUploaderParams) => {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoErrorMessage, setPhotoErrorMessage] = useState('')
  const photoPreviewItems = useMemo(
    () =>
      [
        ...photoUrls.map((photoUrl, index) => ({
          id: `existing-${photoUrl}-${index}`,
          name: `기존 리뷰 사진 ${index + 1}`,
          src: photoUrl,
          shouldRevokeSrc: false,
        })),
        ...photoFiles.map((photoFile, index) => ({
          id: `${photoFile.name}-${photoFile.lastModified}-${photoFile.size}-${index}`,
          name: photoFile.name,
          src: URL.createObjectURL(photoFile),
          shouldRevokeSrc: true,
        })),
      ] satisfies PhotoPreviewItem[],
    [photoFiles, photoUrls],
  )
  const hasSelectedPhotoFiles = photoPreviewItems.length > 0
  const hasReachedMaxPhotoCount =
    photoPreviewItems.length >= REVIEW_PHOTO_MAX_COUNT

  const openPhotoFileDialog = () => {
    if (disabled || hasReachedMaxPhotoCount) {
      return
    }

    photoInputRef.current?.click()
  }

  const handlePhotoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedPhotoFiles = Array.from(event.currentTarget.files ?? [])
    const availablePhotoCount = Math.max(
      REVIEW_PHOTO_MAX_COUNT - photoUrls.length - photoFiles.length,
      0,
    )
    const supportedPhotoFiles = selectedPhotoFiles.filter(
      checkIsSupportedReviewPhotoFile,
    )
    const validPhotoFiles = supportedPhotoFiles.filter(
      (selectedPhotoFile) =>
        selectedPhotoFile.size <= REVIEW_PHOTO_MAX_SIZE_BYTES,
    )
    const nextPhotoFiles = validPhotoFiles.slice(0, availablePhotoCount)
    const hasRejectedPhotoFilesByType =
      supportedPhotoFiles.length !== selectedPhotoFiles.length
    const hasRejectedPhotoFilesBySize =
      validPhotoFiles.length !== supportedPhotoFiles.length
    const hasRejectedPhotoFilesByCount =
      validPhotoFiles.length > availablePhotoCount
    let nextPhotoErrorMessage = ''

    if (hasRejectedPhotoFilesByType) {
      nextPhotoErrorMessage = REVIEW_PHOTO_TYPE_ERROR_MESSAGE
    } else if (hasRejectedPhotoFilesBySize) {
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
    if (deleteIndex < photoUrls.length) {
      onPhotoUrlsChange?.(
        photoUrls.filter((_, photoUrlIndex) => photoUrlIndex !== deleteIndex),
      )

      return
    }

    const photoFileIndex = deleteIndex - photoUrls.length

    onPhotoFilesChange?.(
      photoFiles.filter((_, index) => index !== photoFileIndex),
    )
  }

  useEffect(() => {
    return () => {
      photoPreviewItems.forEach(({ shouldRevokeSrc, src }) => {
        if (shouldRevokeSrc) {
          URL.revokeObjectURL(src)
        }
      })
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
