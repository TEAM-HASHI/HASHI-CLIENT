import { useCallback, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { UploadedImage, UploadUsage } from '@/shared/api/uploadApi'
import {
  useAdminImageUpload,
  type AdminImageUploadStatus,
} from '@/shared/hooks/useAdminImageUpload'

interface AdminImageUploaderProps {
  label: string
  usage: UploadUsage
  value: UploadedImage[]
  multiple?: boolean
  representativeLabel?: boolean
  onChange: (value: UploadedImage[]) => void
  onStatusChange?: (status: AdminImageUploadStatus) => void
}

export const AdminImageUploader = ({
  label,
  usage,
  value,
  multiple = false,
  representativeLabel = false,
  onChange,
  onStatusChange,
}: AdminImageUploaderProps) => {
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const handleUploaded = useCallback(
    (uploaded: UploadedImage) => {
      const nextValue = multiple ? [...valueRef.current, uploaded] : [uploaded]
      valueRef.current = nextValue
      onChange(nextValue)
    },
    [multiple, onChange],
  )
  const { items, status, addFiles, retry, remove } = useAdminImageUpload({
    usage,
    onUploaded: handleUploaded,
  })

  useEffect(() => {
    onStatusChange?.(status)
  }, [onStatusChange, status])

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) void addFiles(multiple ? files : files.slice(0, 1))
    event.target.value = ''
  }

  const move = (index: number, offset: -1 | 1) => {
    const targetIndex = index + offset
    if (targetIndex < 0 || targetIndex >= value.length) return
    const nextValue = [...value]
    const [image] = nextValue.splice(index, 1)
    if (!image) return
    nextValue.splice(targetIndex, 0, image)
    onChange(nextValue)
  }

  return (
    <section className="space-y-3">
      <div>
        <label className="border-primary-200 text-primary-200 hover:bg-primary-100/50 inline-flex h-10 cursor-pointer items-center rounded-md border px-4 text-sm font-bold">
          {label}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            className="sr-only"
            aria-label={label}
            onChange={handleFiles}
          />
        </label>
        <p className="text-cool-gray-500 mt-1 text-xs">
          JPEG, PNG, WebP · 파일당 최대 5MB
        </p>
      </div>

      {value.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {value.map((image, index) => (
            <li
              key={image.fileKey}
              className="border-cool-gray-100 overflow-hidden rounded-lg border bg-white"
            >
              <div className="bg-cool-gray-50 relative aspect-[16/10]">
                <img
                  src={image.fileUrl}
                  alt={`${image.fileName} 미리보기`}
                  className="size-full object-cover"
                />
                {representativeLabel && index === 0 ? (
                  <span className="bg-primary-200 absolute top-2 left-2 rounded px-2 py-1 text-xs font-bold text-white">
                    대표 이미지
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-3">
                <p className="text-cool-gray-800 truncate text-sm font-semibold">
                  {image.fileName}
                </p>
                <div className="flex flex-wrap gap-1">
                  <SmallButton
                    label={`${image.fileName} 앞으로 이동`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    앞으로
                  </SmallButton>
                  <SmallButton
                    label={`${image.fileName} 뒤로 이동`}
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    뒤로
                  </SmallButton>
                  <SmallButton
                    label={`${image.fileName} 삭제`}
                    onClick={() =>
                      onChange(value.filter((_, i) => i !== index))
                    }
                  >
                    삭제
                  </SmallButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-cool-gray-100 flex items-center gap-3 rounded-md border p-3"
            >
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-12 rounded object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {item.file.name}
                </p>
                <p className="text-cool-gray-500 text-xs">
                  {item.status === 'pending' ? '업로드 중…' : item.error}
                </p>
              </div>
              {item.status === 'failed' &&
              !item.error?.includes('이미지만') &&
              !item.error?.includes('5MB') ? (
                <SmallButton
                  label={`${item.file.name} 다시 시도`}
                  onClick={() => void retry(item.id)}
                >
                  다시 시도
                </SmallButton>
              ) : null}
              <SmallButton
                label={`${item.file.name} 항목 삭제`}
                onClick={() => remove(item.id)}
              >
                제거
              </SmallButton>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

const SmallButton = ({
  label,
  disabled = false,
  children,
  onClick,
}: {
  label: string
  disabled?: boolean
  children: string
  onClick: () => void
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="border-cool-gray-100 text-cool-gray-600 rounded border px-2 py-1 text-xs font-semibold disabled:opacity-40"
  >
    {children}
  </button>
)
