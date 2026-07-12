import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  uploadApi,
  type UploadedImage,
  type UploadUsage,
} from '@/shared/api/uploadApi'

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024
let uploadItemSequence = 0

export interface AdminImageUploadStatus {
  pendingCount: number
  failedCount: number
}

export interface AdminImageUploadItem {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'failed'
  error: string | null
}

interface UseAdminImageUploadOptions {
  usage: UploadUsage
  onUploaded: (image: UploadedImage) => void
}

const createPreviewUrl = (file: File) =>
  typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : ''

const revokePreviewUrl = (url: string) => {
  if (url && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url)
  }
}

const validateFile = (file: File) => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return 'JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return '이미지는 5MB 이하여야 합니다.'
  }
  return null
}

export const useAdminImageUpload = ({
  usage,
  onUploaded,
}: UseAdminImageUploadOptions) => {
  const [items, setItems] = useState<AdminImageUploadItem[]>([])
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(
    () => () => {
      itemsRef.current.forEach(({ previewUrl }) => revokePreviewUrl(previewUrl))
    },
    [],
  )

  const uploadItem = useCallback(
    async (item: AdminImageUploadItem) => {
      try {
        const uploaded = await uploadApi.uploadImage(item.file, usage)
        revokePreviewUrl(item.previewUrl)
        setItems((current) => current.filter(({ id }) => id !== item.id))
        onUploaded(uploaded)
      } catch (error) {
        setItems((current) =>
          current.map((currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  status: 'failed',
                  error:
                    error instanceof Error
                      ? error.message
                      : '이미지 업로드에 실패했습니다.',
                }
              : currentItem,
          ),
        )
      }
    },
    [onUploaded, usage],
  )

  const addFiles = useCallback(
    async (files: File[]) => {
      const nextItems = files.map((file) => {
        const error = validateFile(file)
        uploadItemSequence += 1
        return {
          id: `admin-upload-${uploadItemSequence}`,
          file,
          previewUrl: createPreviewUrl(file),
          status: error ? ('failed' as const) : ('pending' as const),
          error,
        }
      })
      setItems((current) => [...current, ...nextItems])

      const validItems = nextItems.filter(({ error }) => !error)
      for (let index = 0; index < validItems.length; index += 3) {
        await Promise.all(validItems.slice(index, index + 3).map(uploadItem))
      }
    },
    [uploadItem],
  )

  const retry = useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((candidate) => candidate.id === id)
      if (!item || validateFile(item.file)) return
      const pendingItem = { ...item, status: 'pending' as const, error: null }
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === id ? pendingItem : candidate,
        ),
      )
      await uploadItem(pendingItem)
    },
    [uploadItem],
  )

  const remove = useCallback((id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id)
      if (removed) revokePreviewUrl(removed.previewUrl)
      return current.filter((item) => item.id !== id)
    })
  }, [])

  const status = useMemo<AdminImageUploadStatus>(
    () => ({
      pendingCount: items.filter(({ status }) => status === 'pending').length,
      failedCount: items.filter(({ status }) => status === 'failed').length,
    }),
    [items],
  )

  return { items, status, addFiles, retry, remove }
}
