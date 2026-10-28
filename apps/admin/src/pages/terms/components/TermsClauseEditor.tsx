import {
  CloseSmallIcon,
  PlusIcon,
  TapDownIcon,
  TapUpIcon,
} from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'
import type { TermsDraft } from '@/pages/terms/termsForm'

export const termsInputClass =
  'border-cool-gray-100 focus:border-primary-200 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none disabled:bg-cool-gray-50 disabled:text-cool-gray-600'

export const TermsClauseEditor = ({
  clauses,
  readOnly,
  onChange,
}: {
  clauses: TermsDraft['clauses']
  readOnly: boolean
  onChange: (clauses: TermsDraft['clauses']) => void
}) => {
  const move = (index: number, direction: number) => {
    const next = [...clauses]
    ;[next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ]
    onChange(next)
  }
  return (
    <section className="space-y-5" aria-label="약관 조항">
      <h2 className="text-cool-gray-900 text-sm font-bold">
        조항{' '}
        <span className="text-cool-gray-500 font-normal">
          {clauses.length}/200
        </span>
      </h2>
      {clauses.map((clause, index) => (
        <fieldset
          key={clause.key}
          className="border-cool-gray-100 min-w-0 space-y-3 border-t pt-4"
        >
          <legend className="text-cool-gray-500 pr-3 text-xs font-semibold">
            조항 {index + 1}
          </legend>
          {!readOnly && (
            <div className="flex justify-end gap-2">
              <IconButton
                size="xs"
                title="위로"
                aria-label={`조항 ${index + 1} 위로`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <TapUpIcon className="size-5" />
              </IconButton>
              <IconButton
                size="xs"
                title="아래로"
                aria-label={`조항 ${index + 1} 아래로`}
                disabled={index === clauses.length - 1}
                onClick={() => move(index, 1)}
              >
                <TapDownIcon className="size-5" />
              </IconButton>
              <IconButton
                size="xs"
                title="제거"
                aria-label={`조항 ${index + 1} 제거`}
                onClick={() =>
                  onChange(clauses.filter((item) => item.key !== clause.key))
                }
              >
                <CloseSmallIcon className="size-5" />
              </IconButton>
            </div>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-cool-gray-500 text-xs font-semibold">
              조항 제목
            </span>
            <input
              aria-label={`조항 ${index + 1} 제목`}
              className={termsInputClass}
              value={clause.heading}
              onChange={(event) =>
                onChange(
                  clauses.map((item) =>
                    item.key === clause.key
                      ? { ...item, heading: event.target.value }
                      : item,
                  ),
                )
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-cool-gray-500 text-xs font-semibold">
              내용
            </span>
            <textarea
              aria-label={`조항 ${index + 1} 내용`}
              className={`${termsInputClass} min-h-40 resize-y leading-6`}
              value={clause.content}
              onChange={(event) =>
                onChange(
                  clauses.map((item) =>
                    item.key === clause.key
                      ? { ...item, content: event.target.value }
                      : item,
                  ),
                )
              }
            />
          </label>
        </fieldset>
      ))}
      {!readOnly && (
        <Button
          type="button"
          size="sm"
          variant="neutral"
          disabled={clauses.length >= 200}
          leftIcon={<PlusIcon className="size-4" />}
          onClick={() =>
            onChange([
              ...clauses,
              { key: crypto.randomUUID(), heading: '', content: '' },
            ])
          }
        >
          조항 추가
        </Button>
      )}
    </section>
  )
}
