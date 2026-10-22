import {
  CloseSmallIcon,
  PlusIcon,
  TapDownIcon,
  TapUpIcon,
} from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'
import type { NoticeBlock, NoticeSpan } from '@/pages/notices/noticeForm'

const inputClass =
  'border-cool-gray-100 focus:border-primary-200 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none'
const blockLabels = {
  PARAGRAPH: '문단',
  BULLET_LIST: '글머리표 목록',
  ORDERED_LIST: '번호 목록',
}

export const NoticeBodyEditor = ({
  value,
  onChange,
}: {
  value: NoticeBlock[]
  onChange: (body: NoticeBlock[]) => void
}) => {
  const updateBlock = (index: number, block: NoticeBlock) =>
    onChange(value.map((current, i) => (i === index ? block : current)))
  const updateItem = (
    blockIndex: number,
    itemIndex: number,
    spans: NoticeSpan[],
  ) => {
    const block = value[blockIndex]
    updateBlock(blockIndex, {
      ...block,
      items: block.items.map((item, i) => (i === itemIndex ? spans : item)),
    })
  }
  const move = (index: number, direction: number) => {
    const next = [...value]
    ;[next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ]
    onChange(next)
  }
  return (
    <div className="space-y-5">
      <h2 className="text-cool-gray-900 text-sm font-bold">본문</h2>
      {value.map((block, blockIndex) => (
        <fieldset
          key={blockIndex}
          className="border-cool-gray-100 min-w-0 space-y-3 border-t pt-4"
        >
          <legend className="text-cool-gray-500 pr-3 text-xs font-semibold">
            본문 {blockIndex + 1}
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">본문 {blockIndex + 1} 유형</span>
              <select
                className={`${inputClass} h-10`}
                value={block.type}
                onChange={(event) => {
                  const type = event.target.value as NoticeBlock['type']
                  updateBlock(blockIndex, {
                    type,
                    items:
                      type === 'PARAGRAPH' && block.items.length > 1
                        ? [
                            block.items.flatMap((item, index) =>
                              index === 0 ? item : [{ text: '\n' }, ...item],
                            ),
                          ]
                        : block.items.length
                          ? block.items
                          : [[{ text: '' }]],
                  })
                }}
              >
                {Object.entries(blockLabels).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <IconButton
              aria-label={`본문 ${blockIndex + 1} 위로`}
              title="위로"
              size="xs"
              disabled={blockIndex === 0}
              onClick={() => move(blockIndex, -1)}
            >
              <TapUpIcon className="size-5" />
            </IconButton>
            <IconButton
              aria-label={`본문 ${blockIndex + 1} 아래로`}
              title="아래로"
              size="xs"
              disabled={blockIndex === value.length - 1}
              onClick={() => move(blockIndex, 1)}
            >
              <TapDownIcon className="size-5" />
            </IconButton>
            <IconButton
              aria-label={`본문 ${blockIndex + 1} 제거`}
              title="문단 제거"
              size="xs"
              onClick={() =>
                onChange(value.filter((_, index) => index !== blockIndex))
              }
            >
              <CloseSmallIcon className="size-5" />
            </IconButton>
          </div>
          {block.items.map((item, itemIndex) => (
            <div key={itemIndex} className="space-y-2">
              {block.type !== 'PARAGRAPH' && (
                <div className="text-cool-gray-500 flex items-center justify-between text-xs font-semibold">
                  <span>항목 {itemIndex + 1}</span>
                  <IconButton
                    size="xs"
                    title="항목 제거"
                    aria-label={`본문 ${blockIndex + 1} 항목 ${itemIndex + 1} 제거`}
                    onClick={() =>
                      updateBlock(blockIndex, {
                        ...block,
                        items: block.items.filter((_, i) => i !== itemIndex),
                      })
                    }
                  >
                    <CloseSmallIcon className="size-4" />
                  </IconButton>
                </div>
              )}
              {item.map((span, spanIndex) => {
                const label = `본문 ${blockIndex + 1} 항목 ${itemIndex + 1} 텍스트 ${spanIndex + 1}`
                const update = (next: NoticeSpan) =>
                  updateItem(
                    blockIndex,
                    itemIndex,
                    item.map((current, i) =>
                      i === spanIndex ? next : current,
                    ),
                  )
                return (
                  <div key={spanIndex} className="space-y-2">
                    <textarea
                      aria-label={label}
                      className={`${inputClass} min-h-28 resize-y leading-6`}
                      value={span.text}
                      onChange={(event) =>
                        update({ ...span, text: event.target.value })
                      }
                    />
                    <div className="bg-cool-gray-50 flex flex-wrap items-center gap-3 rounded-md px-3 py-2">
                      <label className="text-cool-gray-600 flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          className="accent-primary-200 size-3.5"
                          checked={span.bold ?? false}
                          onChange={(event) =>
                            update({ ...span, bold: event.target.checked })
                          }
                        />
                        <strong>굵게</strong>
                      </label>
                      <input
                        aria-label={`${label} 링크`}
                        placeholder="링크 URL"
                        className={`${inputClass} h-8 min-w-0 flex-1`}
                        value={span.href ?? ''}
                        onChange={(event) =>
                          update({
                            ...span,
                            href: event.target.value || undefined,
                          })
                        }
                      />
                      {item.length > 1 && (
                        <IconButton
                          aria-label={`${label} 제거`}
                          title="텍스트 제거"
                          size="xs"
                          onClick={() =>
                            updateItem(
                              blockIndex,
                              itemIndex,
                              item.filter((_, i) => i !== spanIndex),
                            )
                          }
                        >
                          <CloseSmallIcon className="size-4" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                )
              })}
              <Button
                size="sm"
                variant="neutral"
                type="button"
                leftIcon={<PlusIcon className="size-4" />}
                onClick={() =>
                  updateItem(blockIndex, itemIndex, [...item, { text: '' }])
                }
              >
                텍스트 추가
              </Button>
            </div>
          ))}
          {block.type !== 'PARAGRAPH' && (
            <Button
              size="sm"
              type="button"
              variant="neutral"
              leftIcon={<PlusIcon className="size-4" />}
              onClick={() =>
                updateBlock(blockIndex, {
                  ...block,
                  items: [...block.items, [{ text: '' }]],
                })
              }
            >
              목록 항목 추가
            </Button>
          )}
        </fieldset>
      ))}
      <Button
        size="sm"
        type="button"
        variant="neutral"
        leftIcon={<PlusIcon className="size-4" />}
        onClick={() =>
          onChange([...value, { type: 'PARAGRAPH', items: [[{ text: '' }]] }])
        }
      >
        문단 추가
      </Button>
    </div>
  )
}
