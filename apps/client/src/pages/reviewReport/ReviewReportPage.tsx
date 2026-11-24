import { Button, Textarea, showToast } from '@hashi/hds-ui'
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { ReviewModerationDialog } from '@/features/restaurantDetail/components/ReviewModerationDialog'
import { showReviewModerationSuccess } from '@/features/restaurantDetail/components/ReviewModerationToast'
import {
  REVIEW_REPORT_DUPLICATE_MESSAGE,
  ReviewModerationContext,
} from '@/features/restaurantDetail/reviewModeration'
import { ReviewHeader } from '@/features/review/components'
import { getAuthSessionVersion } from '@/shared/auth/authSession'

import defaultRadioUrl from '@/pages/reviewReport/assets/radio-default.svg'
import selectedRadioUrl from '@/pages/reviewReport/assets/radio-selected.svg'

const reasons = [
  '근거 없이 악의적인 내용',
  '음란성 또는 욕설 등 부적절한 내용',
  '명예훼손 및 저작권 침해',
  '다른 매장 리뷰',
  '초상권 침해 또는 개인정보 노출',
  '서비스나 메뉴 등 대가를 목적으로 작성된 리뷰',
  '리뷰 작성 대행 업체를 통한 게재된 허위 리뷰',
] as const

const MAX_DETAILS_LENGTH = 1000
const MAX_DETAILS_ROWS = 3
const REPORT_FAILURE_MESSAGE = '신고를 접수하지 못했어요.'

const fitDetailsTextarea = (textarea: HTMLTextAreaElement) => {
  const scrollTop = textarea.scrollTop
  textarea.style.removeProperty('height')
  if (!textarea.value) return

  // Keep scrollbar width from changing line wrapping during measurement.
  textarea.style.overflowY = 'hidden'
  const borderHeight = textarea.offsetHeight - textarea.clientHeight
  const contentHeight = textarea.scrollHeight + borderHeight
  // Measure the row limit with the native control's current font and padding.
  const rows = textarea.rows
  textarea.rows = MAX_DETAILS_ROWS
  const maxHeight = textarea.offsetHeight
  textarea.rows = rows
  textarea.style.height = `${Math.min(contentHeight, maxHeight)}px`
  textarea.style.removeProperty('overflow-y')
  textarea.scrollTop = scrollTop
}

export const ReviewReportPage = () => {
  const { reviewId } = useParams()
  return <ReviewReportForm key={reviewId} reviewId={reviewId} />
}

const ReviewReportForm = ({ reviewId }: { reviewId?: string }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const moderation = useContext(ReviewModerationContext)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const detailsRef = useRef<HTMLTextAreaElement>(null)
  const submitting = useRef(false)
  const active = useRef(false)

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  const status =
    reviewId && /^[1-9]\d*$/.test(reviewId)
      ? moderation?.getReviewStatus(reviewId)
      : undefined

  useLayoutEffect(() => {
    if (detailsRef.current) fitDetailsTextarea(detailsRef.current)
  }, [details, status])

  useEffect(() => {
    const textarea = detailsRef.current
    if (!textarea) return
    const resize = () => fitDetailsTextarea(textarea)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [status])

  const goBack = () => {
    if (location.state?.fromReviewList === true) void navigate(-1)
    else void navigate(ROUTES.home, { replace: true })
  }

  const submitReport = async () => {
    if (
      submitting.current ||
      !reviewId ||
      !moderation ||
      !reason ||
      status !== 'available'
    )
      return

    submitting.current = true
    const session = getAuthSessionVersion()
    setPending(true)
    try {
      const result = await moderation.reportReview({
        reviewId,
        reason,
        details,
      })
      if (!active.current || getAuthSessionVersion() !== session) return

      if (result === 'already-reported') {
        showToast({ children: REVIEW_REPORT_DUPLICATE_MESSAGE })
      } else {
        showReviewModerationSuccess('신고가 정상적으로 접수되었어요.')
      }
      goBack()
    } catch {
      if (!active.current || getAuthSessionVersion() !== session) return
      setConfirmOpen(false)
      showToast({ children: REPORT_FAILURE_MESSAGE })
    } finally {
      submitting.current = false
      if (active.current) setPending(false)
    }
  }

  return (
    <section
      aria-label="리뷰 신고"
      className="flex min-h-dvh w-full flex-col bg-white"
    >
      <div className="z-fixed sticky top-0 bg-white pt-[max(45px,env(safe-area-inset-top))]">
        <ReviewHeader
          title="리뷰 신고"
          onBackClick={pending ? undefined : goBack}
        />
      </div>
      {status === 'available' ? (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            if (reason && !pending) setConfirmOpen(true)
          }}
        >
          <div className="flex flex-col gap-12 px-5 pt-9">
            <fieldset className="min-w-0">
              <legend className="typo-sub-header-1 text-primary-200 mb-6">
                신고 사유{' '}
                <span className="typo-body-6 text-primary-400">필수</span>
              </legend>
              <div className="flex flex-col gap-5">
                {reasons.map((option) => (
                  <label
                    key={option}
                    className="typo-body-4 text-primary-200 relative flex min-h-5 cursor-pointer items-center gap-3 break-keep"
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="reason"
                      checked={reason === option}
                      onChange={() => setReason(option)}
                      required
                    />
                    <img
                      className="shrink-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                      src={
                        reason === option ? selectedRadioUrl : defaultRadioUrl
                      }
                      width={20}
                      height={20}
                      alt=""
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-3">
              <label
                className="typo-sub-header-1 text-primary-200"
                htmlFor="review-report-details"
              >
                상세 내용
              </label>
              <Textarea
                id="review-report-details"
                ref={detailsRef}
                name="details"
                maxLength={MAX_DETAILS_LENGTH}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="신고 사유를 자세히 작성해 주세요."
                value={details}
                helperText={
                  details.length === MAX_DETAILS_LENGTH
                    ? '최대 1000자까지 입력할 수 있어요.'
                    : undefined
                }
                className="[&_p[id$='helper-text']]:text-primary-400"
                textareaClassName="overflow-y-auto"
              />
            </div>
          </div>
          <footer className="mt-auto px-5 pt-11 pb-[max(48px,env(safe-area-inset-bottom))]">
            <Button
              className="bg-cool-gray-800 h-[42px]"
              disabled={!reason || pending}
              size="lg"
              type="submit"
              width="full"
            >
              신고하기
            </Button>
          </footer>
        </form>
      ) : (
        <p className="typo-body-4 text-primary-200 flex flex-1 items-center justify-center px-5 text-center">
          {status === 'reported'
            ? REVIEW_REPORT_DUPLICATE_MESSAGE
            : '신고할 리뷰 정보를 확인할 수 없어요.'}
        </p>
      )}
      <ReviewModerationDialog
        confirmLabel="신고하기"
        description={
          <>
            접수된 신고 내용은 검토 후 처리되며,
            <br />
            기준에 맞지 않으면 조치되지 않을 수 있습니다.
          </>
        }
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void submitReport()}
        open={confirmOpen}
        pending={pending}
        title="이 리뷰를 신고할까요?"
      />
    </section>
  )
}
