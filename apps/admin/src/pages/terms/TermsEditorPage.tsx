import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Button, Dialog } from '@hashi/hds-ui'
import { ROUTES } from '@/app/router/path'
import { PageHeader } from '@/shared/components/PageHeader'
import type {
  AdminTerms,
  TermsType,
  TermsTypeInfo,
} from '@/pages/terms/api/termsApi'
import {
  termsDetailOptions,
  termsTypesOptions,
  usePublishTermsMutation,
  useSaveTermsMutation,
} from '@/pages/terms/queries/termsQueries'
import {
  createTermsDraft,
  toTermsRequest,
  validateTerms,
  termsErrorMessage,
  termsStatusLabel,
} from '@/pages/terms/termsForm'
import {
  TermsClauseEditor,
  termsInputClass,
} from '@/pages/terms/components/TermsClauseEditor'

export const TermsEditorPage = () => {
  const { termsId } = useParams()
  const [params] = useSearchParams()
  const id = Number(termsId)
  const isNew = termsId === undefined
  const validId = Number.isSafeInteger(id) && id > 0
  const types = useQuery(termsTypesOptions())
  const detail = useQuery({
    ...termsDetailOptions(id),
    enabled: !isNew && validId,
  })
  const selected =
    types.data?.find(({ type }) => type === params.get('type')) ??
    types.data?.[0]
  const error =
    !isNew && !validId
      ? '올바르지 않은 약관 주소입니다.'
      : isNew && !selected?.type && types.isError
        ? termsErrorMessage(types.error)
        : !isNew &&
            !detail.isPending &&
            (detail.data?.termsId !== id || !detail.data.type)
          ? termsErrorMessage(detail.error)
          : undefined
  if (error)
    return (
      <section className="space-y-4 p-8">
        <p role="alert">{error}</p>
        <Button
          size="sm"
          variant="neutral"
          onClick={() => void (isNew ? types.refetch() : detail.refetch())}
        >
          다시 시도
        </Button>
        <Link to={ROUTES.terms} className="ml-4 underline">
          목록으로
        </Link>
      </section>
    )
  if ((isNew && types.isPending) || (!isNew && detail.isPending))
    return (
      <p role="status" className="p-8">
        약관을 불러오는 중입니다.
      </p>
    )
  if (isNew && !selected?.type)
    return (
      <p role="alert" className="p-8">
        등록 가능한 약관 유형이 없습니다.
      </p>
    )
  const terms = isNew ? undefined : detail.data
  return (
    <TermsEditor
      key={isNew ? 'new' : id}
      terms={terms}
      types={types.data ?? []}
      initialType={terms?.type ?? selected!.type!}
    />
  )
}

const TermsEditor = ({
  terms,
  types,
  initialType,
}: {
  terms?: AdminTerms
  types: TermsTypeInfo[]
  initialType: TermsType
}) => {
  const navigate = useNavigate()
  const serverDraft = useMemo(
    () => createTermsDraft(initialType, terms),
    [initialType, terms],
  )
  const [draft, setDraft] = useState(serverDraft)
  const [baseline, setBaseline] = useState(() => toTermsRequest(draft))
  const [error, setError] = useState('')
  const [confirmPublish, setConfirmPublish] = useState(false)
  const save = useSaveTermsMutation()
  const publish = usePublishTermsMutation()
  const submitting = useRef(false)
  const allowNavigation = useRef(false)
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const body = toTermsRequest(draft)
  const readOnly = Boolean(terms && terms.status !== 'DRAFT')
  const dirty = JSON.stringify(body) !== JSON.stringify(baseline)
  const serverChanged =
    Boolean(terms) &&
    (JSON.stringify(toTermsRequest(serverDraft)) !== JSON.stringify(baseline) ||
      (readOnly && dirty))
  const busy = save.isPending || publish.isPending
  const blocker = useBlocker(
    () => !allowNavigation.current && (dirty || submitting.current),
  )
  useEffect(() => {
    if (!dirty && !busy) return
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty, busy])
  const handleSave = async () => {
    if (readOnly || serverChanged || submitting.current) return
    const message = validateTerms(body)
    if (message) {
      setError(message)
      return
    }
    submitting.current = true
    setError('')
    try {
      const result = await save.mutateAsync({
        id: terms?.termsId ?? null,
        body,
      })
      if (!mounted.current) return
      if (
        !Number.isSafeInteger(result.termsId) ||
        !result.termsId ||
        result.termsId < 0
      )
        throw new Error('저장 결과의 약관 ID를 확인할 수 없습니다.')
      setBaseline(body)
      if (!terms) {
        allowNavigation.current = true
        navigate(`${ROUTES.terms}/${result.termsId}`, { replace: true })
      }
    } catch (cause) {
      if (mounted.current) setError(termsErrorMessage(cause))
    } finally {
      submitting.current = false
    }
  }
  return (
    <div className="min-h-dvh bg-white">
      <PageHeader
        title={terms ? '이용약관 상세' : '새 약관 버전 작성'}
        description=""
      >
        <Link
          to={`${ROUTES.terms}?type=${draft.type}`}
          className="text-cool-gray-600 hover:bg-cool-gray-50 border-cool-gray-100 inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold"
        >
          목록으로
        </Link>
      </PageHeader>
      <form
        className="mx-auto max-w-4xl space-y-6 px-5 py-6 lg:px-8"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSave()
        }}
      >
        <div className="border-cool-gray-100 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <span className="bg-primary-100 text-primary-200 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold">
            {terms ? termsStatusLabel(terms.status) : '새 초안'}
          </span>
          {!readOnly && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="neutral"
                type="submit"
                disabled={busy || !dirty || serverChanged}
                loading={save.isPending}
              >
                초안 저장
              </Button>
              {terms?.termsId && (
                <Button
                  size="sm"
                  type="button"
                  disabled={busy || dirty || serverChanged}
                  onClick={() => setConfirmPublish(true)}
                >
                  게시
                </Button>
              )}
            </div>
          )}
        </div>
        {readOnly && (
          <p className="text-cool-gray-500 text-sm">
            게시된 약관은 수정하거나 삭제할 수 없습니다. 변경하려면 새 버전을
            작성해주세요.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="text-error bg-error/5 rounded-md p-3 text-sm"
          >
            {error}
          </p>
        )}
        {serverChanged && (
          <div
            role="alert"
            className="border-cool-gray-100 space-y-3 rounded-md border p-3 text-sm"
          >
            <p>
              서버의 약관 내용이나 게시 상태가 변경되었습니다. 입력한 내용은
              유지했습니다. 최신 저장본으로 교체하면 현재 입력한 내용은
              사라집니다.
            </p>
            <Button
              type="button"
              size="sm"
              variant="neutral"
              disabled={busy}
              onClick={() => {
                setDraft(serverDraft)
                setBaseline(toTermsRequest(serverDraft))
                setError('')
                setConfirmPublish(false)
              }}
            >
              최신 저장본으로 교체
            </Button>
          </div>
        )}
        <fieldset disabled={busy || readOnly} className="min-w-0 space-y-6">
          <label className="flex flex-col gap-1">
            <span className="text-cool-gray-500 text-xs font-semibold">
              약관 유형
            </span>
            <select
              aria-label="약관 유형"
              className={`${termsInputClass} h-10`}
              value={draft.type}
              disabled={Boolean(terms) || busy}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  type: event.target.value as TermsType,
                }))
              }
            >
              {types.length ? (
                types.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.title}
                  </option>
                ))
              ) : (
                <option value={draft.type}>{draft.type}</option>
              )}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-cool-gray-500 text-xs font-semibold">
              제목
            </span>
            <input
              aria-label="약관 제목"
              className={`${termsInputClass} h-10`}
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-cool-gray-500 text-xs font-semibold">
                버전
              </span>
              <input
                aria-label="약관 버전"
                className={`${termsInputClass} h-10`}
                value={draft.version}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    version: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-cool-gray-500 text-xs font-semibold">
                시행일
              </span>
              <input
                aria-label="시행일"
                type="date"
                min="1000-01-01"
                max="9999-12-31"
                className={`${termsInputClass} h-10 min-w-0`}
                value={draft.effectiveDate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    effectiveDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <TermsClauseEditor
            clauses={draft.clauses}
            readOnly={readOnly}
            onChange={(clauses) =>
              setDraft((current) => ({ ...current, clauses }))
            }
          />
        </fieldset>
      </form>
      <Dialog.Root
        type="alertdialog"
        open={confirmPublish}
        onOpenChange={(open) => {
          if (!publish.isPending) setConfirmPublish(open)
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>이 버전을 게시할까요?</Dialog.Title>
            <Dialog.Description>
              시행일이 미래여도 게시 즉시 현재 약관으로 적용됩니다. 기존 적용
              버전은 보관되며, 게시한 버전은 수정하거나 삭제할 수 없습니다.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              size="sm"
              variant="neutral"
              disabled={busy}
              onClick={() => setConfirmPublish(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              disabled={busy || dirty || readOnly || serverChanged}
              loading={publish.isPending}
              onClick={async () => {
                if (
                  !terms?.termsId ||
                  submitting.current ||
                  dirty ||
                  readOnly ||
                  serverChanged
                )
                  return
                submitting.current = true
                setError('')
                try {
                  await publish.mutateAsync(terms.termsId)
                  if (mounted.current) setConfirmPublish(false)
                } catch (cause) {
                  if (mounted.current) {
                    setError(termsErrorMessage(cause))
                    setConfirmPublish(false)
                  }
                } finally {
                  submitting.current = false
                }
              }}
            >
              게시
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root
        type="alertdialog"
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') blocker.reset()
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>저장하지 않고 나갈까요?</Dialog.Title>
            <Dialog.Description>
              저장하지 않은 변경사항은 사라집니다.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              size="sm"
              variant="neutral"
              onClick={() => blocker.state === 'blocked' && blocker.reset()}
            >
              계속 작성
            </Button>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => blocker.state === 'blocked' && blocker.proceed()}
            >
              나가기
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
