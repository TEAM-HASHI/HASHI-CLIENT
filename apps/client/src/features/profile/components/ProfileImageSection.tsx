import { PencilIcon } from '@hashi/hds-icons'
import { Avatar, Button, IconButton } from '@hashi/hds-ui'
import { type ChangeEvent, useRef } from 'react'

import { FieldError } from '@/features/profile/components/FieldError'
import { PROFILE_IMAGE_ACCEPT } from '@/features/profile/constants/profileImage'

interface ProfileImageSectionProps {
  disabled?: boolean
  previewUrl?: string
  errorMessage?: string
  onImageChange: (file: File) => void
  onImageDelete: () => void
}

export const ProfileImageSection = ({
  disabled = false,
  previewUrl,
  errorMessage,
  onImageChange,
  onImageDelete,
}: ProfileImageSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      return
    }

    onImageChange(file)
    event.currentTarget.value = ''
  }

  return (
    <section
      aria-label="프로필 이미지"
      className="flex flex-col items-center py-4"
    >
      <div className="relative">
        <Avatar alt="프로필 이미지" size="lg" src={previewUrl} />
        <IconButton
          aria-label="프로필 이미지 수정"
          className="absolute right-0 bottom-0 size-7"
          disabled={disabled}
          onClick={handleImageButtonClick}
          size="xs"
          variant="soft"
        >
          <PencilIcon className="size-5" />
        </IconButton>
      </div>
      <input
        ref={fileInputRef}
        aria-label="프로필 이미지 파일 선택"
        aria-describedby={errorMessage ? 'profile-image-file-error' : undefined}
        accept={PROFILE_IMAGE_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
        type="file"
      />
      <Button
        className="mt-1"
        disabled={disabled || !previewUrl}
        onClick={onImageDelete}
        size="md"
        type="button"
        variant="ghost"
      >
        프로필 삭제
      </Button>
      <FieldError id="profile-image-file-error" message={errorMessage} />
    </section>
  )
}
