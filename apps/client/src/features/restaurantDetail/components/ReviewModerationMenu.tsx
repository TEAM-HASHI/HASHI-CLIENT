import { MenuIcon } from '@hashi/hds-icons'
import { showToast } from '@hashi/hds-ui'
import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getReviewReportPath } from '@/app/router/routePaths'
import { ROUTES } from '@/app/router/path'
import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { getPathFromLocation } from '@/features/auth/utils/authRedirect'
import {
  REVIEW_REPORT_DUPLICATE_MESSAGE,
  type ReviewModeration,
} from '@/features/restaurantDetail/reviewModeration'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

interface ReviewModerationMenuProps {
  reviewId: string
  reviewerName: string
  restaurantId: string | undefined
  moderation: ReviewModeration
  onBlock: () => void
}

export const ReviewModerationMenu = ({
  reviewId,
  reviewerName,
  restaurantId,
  moderation,
  onBlock,
}: ReviewModerationMenuProps) => {
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const { startKakaoOAuth } = useKakaoOAuthStart()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      )
        setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  const closeMenu = () => {
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  const handleAction = (action: 'block' | 'report') => {
    closeMenu()
    if (!isAuthenticated) {
      setLoginOpen(true)
      return
    }

    const status = moderation.getReviewStatus(reviewId)
    if (status !== 'available' && status !== 'reported') return

    if (action === 'block') {
      onBlock()
      return
    }
    if (status === 'reported') {
      showToast({ children: REVIEW_REPORT_DUPLICATE_MESSAGE })
      return
    }

    const from = getPathFromLocation(location)
    void navigate(from, {
      replace: true,
      state: {
        ...location.state,
        activeTab: 'review',
        ...(restaurantId ? { restaurantId: Number(restaurantId) } : {}),
        ...(location.pathname === ROUTES.map ? { restoreMapDetail: true } : {}),
      },
    })
    void navigate(getReviewReportPath(reviewId), {
      state: { fromReviewList: true },
    })
  }

  return (
    <div
      className="relative ml-auto shrink-0"
      ref={menuRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          event.stopPropagation()
          closeMenu()
        }
      }}
    >
      <button
        aria-label={`${reviewerName} 리뷰 더보기`}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="flex size-8 items-center justify-end rounded focus-visible:outline-2"
        onClick={() => setOpen(!open)}
        ref={triggerRef}
        type="button"
      >
        <MenuIcon className="text-warm-gray-300 size-[18px]" />
      </button>
      {open && (
        <div
          className="border-warm-gray-100 absolute top-full right-0 z-10 w-[142px] rounded-[12px] border bg-white px-2"
          id={menuId}
        >
          <button
            className="typo-body-5 text-primary-200 border-secondary-200 block h-10 w-full border-b focus-visible:outline-2"
            onClick={() => handleAction('block')}
            type="button"
          >
            차단하기
          </button>
          <button
            className="typo-body-5 text-primary-400 block h-10 w-full focus-visible:outline-2"
            onClick={() => handleAction('report')}
            type="button"
          >
            신고하기
          </button>
        </div>
      )}
      <AuthGateBottomSheet
        onKakaoPress={() => startKakaoOAuth(getPathFromLocation(location))}
        onOpenChange={setLoginOpen}
        open={loginOpen}
      />
    </div>
  )
}
