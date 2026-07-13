import { PencilIcon } from '@hashi/hds-icons'
import { Avatar, IconButton } from '@hashi/hds-ui'
import { type ChangeEvent, useRef } from 'react'

import { FieldError } from '@/pages/profileNew/components/FieldError'
import { PROFILE_IMAGE_ACCEPT } from '@/pages/profileNew/constants/profileImage'
import profileEmptyImage from '@/shared/assets/images/profile-empty.svg'

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
      className="flex flex-col items-center pt-6 pb-7"
    >
      <div className="relative">
        <Avatar
          alt="프로필 이미지"
          className="bg-cool-gray-100"
          size="lg"
          src={previewUrl ?? profileEmptyImage}
        />
        <IconButton
          aria-label="프로필 이미지 수정"
          className="absolute right-[-4px] bottom-0 size-10 rounded-full bg-white shadow-sm"
          disabled={disabled}
          onClick={handleImageButtonClick}
          size="md"
        >
          <PencilIcon className="size-[25px]" />
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
      <button
        className="typo-body-3 text-primary-200 mt-4 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={onImageDelete}
        type="button"
      >
        프로필 삭제
      </button>
      <FieldError id="profile-image-file-error" message={errorMessage} />
    </section>
  )
}
