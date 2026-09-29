import { useCallback, useRef } from 'react'

import { uploadProfileImage } from '@/pages/profileNew/api/uploadProfileImage'

export const useUploadedProfileImageKey = () => {
  const uploadedProfileImageRef = useRef<
    { file: File; fileKey: string } | undefined
  >(undefined)

  const getUploadedProfileImageKey = useCallback(async (file: File) => {
    const cachedProfileImage = uploadedProfileImageRef.current

    if (cachedProfileImage?.file === file) {
      return cachedProfileImage.fileKey
    }

    const fileKey = await uploadProfileImage(file)
    uploadedProfileImageRef.current = {
      file,
      fileKey,
    }

    return fileKey
  }, [])

  return { getUploadedProfileImageKey }
}
