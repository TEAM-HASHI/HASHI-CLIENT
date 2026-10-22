import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { CloseSmallIcon, TapDownIcon, TapUpIcon } from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'
import {
  uploadNoticeImage,
  validateNoticeImage,
} from '@/pages/notices/api/noticeImageApi'
import { noticeErrorMessage } from '@/pages/notices/noticeForm'

export interface NoticeImageItem {
  id: string
  assetId?: string
  url?: string
  file?: File
  status: 'ready' | 'uploading' | 'error'
  error?: string
}

export const NoticeImages = ({
  items,
  onChange,
}: {
  items: NoticeImageItem[]
  onChange: Dispatch<SetStateAction<NoticeImageItem[]>>
}) => {
  const [error, setError] = useState('')
  const controllers = useRef(new Map<string, AbortController>())
  const objectUrls = useRef(new Set<string>())
  useEffect(() => {
    const active = controllers.current
    const urls = objectUrls.current
    return () => {
      active.forEach((controller) => controller.abort())
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const upload = async (item: NoticeImageItem) => {
    if (!item.file || controllers.current.has(item.id)) return
    const controller = new AbortController()
    controllers.current.set(item.id, controller)
    onChange((current) =>
      current.map((image) =>
        image.id === item.id
          ? { ...image, status: 'uploading', error: undefined }
          : image,
      ),
    )
    try {
      const assetId = await uploadNoticeImage(item.file, controller.signal)
      if (!controller.signal.aborted)
        onChange((current) =>
          current.map((image) =>
            image.id === item.id
              ? { ...image, assetId, status: 'ready' }
              : image,
          ),
        )
    } catch (cause) {
      if (!controller.signal.aborted)
        onChange((current) =>
          current.map((image) =>
            image.id === item.id
              ? { ...image, status: 'error', error: noticeErrorMessage(cause) }
              : image,
          ),
        )
    } finally {
      controllers.current.delete(item.id)
    }
  }

  const move = (index: number, direction: number) =>
    onChange((current) => {
      const next = [...current]
      ;[next[index], next[index + direction]] = [
        next[index + direction],
        next[index],
      ]
      return next
    })
  return (
    <section
      className="border-cool-gray-100 space-y-3 border-t pt-6"
      aria-label="첨부 이미지"
    >
      <h2 className="text-cool-gray-900 flex items-center gap-2 text-sm font-bold">
        첨부 이미지{' '}
        <span className="text-cool-gray-500 text-xs font-normal">
          {items.length}/10
        </span>
      </h2>
      <label className="border-primary-200 text-primary-200 hover:bg-primary-100/50 focus-within:outline-primary-200 inline-flex h-10 cursor-pointer items-center rounded-md border px-4 text-sm font-bold focus-within:outline-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40">
        이미지 선택
        <input
          className="sr-only"
          aria-label="이미지 첨부"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={
            items.length >= 10 ||
            items.some((item) => item.status === 'uploading')
          }
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = ''
            try {
              if (files.length + items.length > 10)
                throw new Error('이미지는 최대 10장까지 첨부할 수 있습니다.')
              files.forEach(validateNoticeImage)
              const additions = files.map((file): NoticeImageItem => {
                const url = URL.createObjectURL(file)
                objectUrls.current.add(url)
                return {
                  id: crypto.randomUUID(),
                  file,
                  url,
                  status: 'uploading',
                }
              })
              setError('')
              onChange((current) => [...current, ...additions])
              additions.forEach((item) => void upload(item))
            } catch (cause) {
              setError(noticeErrorMessage(cause))
            }
          }}
        />
      </label>
      <p className="text-cool-gray-500 text-xs">
        JPG, PNG, WebP · 파일당 최대 10MB
      </p>
      {error && (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      )}
      <ol className="divide-cool-gray-100 divide-y">
        {items.map((item, index) => (
          <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
            {item.url ? (
              <img
                src={item.url}
                alt={`첨부 이미지 ${index + 1}`}
                className="size-20 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="bg-cool-gray-100 flex size-20 items-center justify-center text-xs">
                미리보기 없음
              </span>
            )}
            <div className="text-cool-gray-800 min-w-0 flex-1 text-sm font-semibold">
              <p className="break-all">
                {item.file?.name ?? `이미지 ${index + 1}`}
              </p>
              {item.status === 'uploading' && (
                <p
                  role="status"
                  className="text-cool-gray-500 mt-1 text-xs font-normal"
                >
                  업로드 및 이미지 처리 중
                </p>
              )}
              {item.error && (
                <p role="alert" className="text-error">
                  {item.error}
                </p>
              )}
            </div>
            {item.status === 'error' && (
              <Button
                type="button"
                size="sm"
                variant="neutral"
                onClick={() => void upload(item)}
              >
                재시도
              </Button>
            )}
            <IconButton
              type="button"
              size="xs"
              title="앞으로"
              aria-label={`이미지 ${index + 1} 앞으로`}
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              <TapUpIcon className="size-5" />
            </IconButton>
            <IconButton
              type="button"
              size="xs"
              title="뒤로"
              aria-label={`이미지 ${index + 1} 뒤로`}
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
            >
              <TapDownIcon className="size-5" />
            </IconButton>
            <IconButton
              type="button"
              size="xs"
              title="제거"
              aria-label={`이미지 ${index + 1} 제거`}
              onClick={() => {
                controllers.current.get(item.id)?.abort()
                if (item.url && objectUrls.current.delete(item.url))
                  URL.revokeObjectURL(item.url)
                onChange((current) =>
                  current.filter((image) => image.id !== item.id),
                )
              }}
            >
              <CloseSmallIcon className="size-5" />
            </IconButton>
          </li>
        ))}
      </ol>
    </section>
  )
}
