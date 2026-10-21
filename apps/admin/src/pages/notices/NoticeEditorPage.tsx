import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom'
import { Button, Dialog } from '@hashi/hds-ui'
import { ROUTES } from '@/app/router/path'
import { PageHeader } from '@/shared/components/PageHeader'
import {
  noticeDetailOptions,
  usePublishNoticeMutation,
  useSaveNoticeMutation,
} from '@/pages/notices/queries/noticeQueries'
import type { AdminNotice } from '@/pages/notices/api/noticeApi'
import {
  createNoticeDraft,
  noticeErrorMessage,
  validateNotice,
} from '@/pages/notices/noticeForm'
import { NoticeBodyEditor } from '@/pages/notices/components/NoticeBodyEditor'
import { NoticeImages } from '@/pages/notices/components/NoticeImages'
import type { NoticeImageItem } from '@/pages/notices/components/NoticeImages'

export const NoticeEditorPage = () => {
  const { noticeId } = useParams()
  const id = Number(noticeId)
  const isNew = noticeId === undefined
  const validId = Number.isSafeInteger(id) && id > 0
  const detail = useQuery({
    ...noticeDetailOptions(id),
    enabled: !isNew && validId,
  })
  if (!isNew && !validId)
    return (
      <p role="alert" className="p-8">
        올바르지 않은 공지사항 주소입니다.
      </p>
    )
  if (!isNew && detail.isPending)
    return (
      <p role="status" className="p-8">
        공지사항을 불러오는 중입니다.
      </p>
    )
  if (!isNew && detail.data?.noticeId !== id)
    return (
      <section className="space-y-4 p-8">
        <p role="alert">
          {detail.error
            ? noticeErrorMessage(detail.error)
            : '공지사항 정보를 확인할 수 없습니다.'}
        </p>
        <Button variant="neutral" onClick={() => void detail.refetch()}>
          다시 시도
        </Button>
        <Link to={ROUTES.notices} className="ml-4 underline">
          목록으로
        </Link>
      </section>
    )
  return (
    <NoticeEditor
      key={isNew ? 'new' : id}
      notice={isNew ? undefined : detail.data}
    />
  )
}

const NoticeEditor = ({ notice }: { notice?: AdminNotice }) => {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(notice)
  const [baseline, setBaseline] = useState(() => createNoticeDraft(notice))
  const [draft, setDraft] = useState(baseline)
  const [images, setImages] = useState<NoticeImageItem[]>(() =>
    (notice?.images ?? []).map((image) => ({
      id: image.assetId!,
      assetId: image.assetId,
      url: image.image?.defaultSource?.url,
      status: 'ready',
    })),
  )
  const [error, setError] = useState('')
  const [confirmPublish, setConfirmPublish] = useState(false)
  const save = useSaveNoticeMutation()
  const publish = usePublishNoticeMutation()
  const submitting = useRef(false)
  const mounted = useRef(false)
  const allowNavigation = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const body = {
    ...draft,
    imageAssetIds: images.flatMap((image) =>
      image.assetId ? [image.assetId] : [],
    ),
  }
  const imagesBlocked = images.some((image) => image.status !== 'ready')
  const dirty =
    imagesBlocked || JSON.stringify(body) !== JSON.stringify(baseline)
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

  const submit = async () => {
    if (submitting.current || imagesBlocked) return
    const message = validateNotice(body)
    if (message) {
      setError(message)
      return
    }
    submitting.current = true
    setError('')
    try {
      const result = await save.mutateAsync({
        id: saved?.noticeId ?? null,
        body,
      })
      if (!mounted.current) return
      if (!Number.isSafeInteger(result.noticeId) || !result.noticeId)
        throw new Error('저장 결과의 공지사항 ID를 확인할 수 없습니다.')
      setSaved(result)
      setBaseline(body)
      if (!saved) {
        allowNavigation.current = true
        navigate(`${ROUTES.notices}/${result.noticeId}`, { replace: true })
      }
    } catch (cause) {
      if (mounted.current) setError(noticeErrorMessage(cause))
    } finally {
      submitting.current = false
    }
  }

  return (
    <div className="min-h-dvh bg-white">
      <PageHeader
        title={saved ? '공지사항 상세 및 수정' : '공지사항 작성'}
        description=""
      >
        <Link
          to={ROUTES.notices}
          className="text-cool-gray-600 hover:bg-cool-gray-50 border-cool-gray-100 inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold"
        >
          목록으로
        </Link>
      </PageHeader>
      <form
        className="mx-auto max-w-4xl space-y-6 px-5 py-6 lg:px-8"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="border-cool-gray-100 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <span className="bg-primary-100 text-primary-200 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold">
            {saved?.status === 'PUBLISHED' ? '게시됨' : '임시 저장'}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={saved?.status === 'PUBLISHED' ? 'primary' : 'neutral'}
              type="submit"
              disabled={busy || imagesBlocked || !dirty}
              loading={save.isPending}
            >
              {saved?.status === 'PUBLISHED' ? '수정 저장' : '임시 저장'}
            </Button>
            {saved?.noticeId && saved.status !== 'PUBLISHED' && (
              <Button
                size="sm"
                type="button"
                disabled={busy || dirty}
                onClick={() => setConfirmPublish(true)}
              >
                게시
              </Button>
            )}
          </div>
        </div>
        {error && (
          <p
            role="alert"
            className="text-error bg-error/5 rounded-md p-3 text-sm"
          >
            {error}
          </p>
        )}
        <fieldset disabled={busy} className="min-w-0 space-y-6">
          <label className="flex flex-col gap-1">
            <span className="text-cool-gray-500 text-xs font-semibold">
              제목
            </span>
            <input
              aria-label="공지사항 제목"
              className="border-cool-gray-100 focus:border-primary-200 h-10 w-full rounded-md border bg-white px-3 text-sm outline-none"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <NoticeBodyEditor
            value={draft.body}
            onChange={(next) =>
              setDraft((current) => ({ ...current, body: next }))
            }
          />
          <NoticeImages items={images} onChange={setImages} />
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
            <Dialog.Title>공지사항을 게시할까요?</Dialog.Title>
            <Dialog.Description>
              게시하면 사용자 공지사항 목록에 표시됩니다.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              variant="neutral"
              size="sm"
              disabled={publish.isPending}
              onClick={() => setConfirmPublish(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              disabled={publish.isPending || dirty}
              loading={publish.isPending}
              onClick={async () => {
                if (!saved?.noticeId || submitting.current || dirty) return
                submitting.current = true
                setError('')
                try {
                  setSaved(await publish.mutateAsync(saved.noticeId))
                  setConfirmPublish(false)
                } catch (cause) {
                  setError(noticeErrorMessage(cause))
                  setConfirmPublish(false)
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
