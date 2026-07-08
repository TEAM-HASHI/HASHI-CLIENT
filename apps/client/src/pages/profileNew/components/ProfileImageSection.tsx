import { PencilIcon } from '@hashi/hds-icons'
import { Avatar, IconButton } from '@hashi/hds-ui'
import { type ChangeEvent, useRef } from 'react'

import profileEmptyImage from '@/shared/assets/images/profile-empty.svg'

interface ProfileImageSectionProps {
  previewUrl?: string
  onImageChange: (file: File) => void
  onImageDelete: () => void
}

export const ProfileImageSection = ({
  previewUrl,
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
          onClick={handleImageButtonClick}
          size="md"
        >
          <PencilIcon className="size-[25px]" />
        </IconButton>
      </div>
      <input
        ref={fileInputRef}
        aria-label="프로필 이미지 파일 선택"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />
      <button
        className="typo-body-3 text-primary-200 mt-4"
        onClick={onImageDelete}
        type="button"
      >
        프로필 삭제
      </button>
    </section>
  )
}
