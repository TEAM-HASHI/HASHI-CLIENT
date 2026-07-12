import { MenuIcon } from '@hashi/hds-icons'
import { Dialog, StarRating } from '@hashi/hds-ui'
import { useEffect, useId, useRef, useState } from 'react'

import { ReviewDeleteConfirmDialog } from '@/features/review/components'
import { ReviewImagePlaceholder } from '@/pages/myReviews/components/ReviewImagePlaceholder'
import type { WrittenReview } from '@/pages/myReviews/types/myReview'

interface WrittenReviewCardProps {
  isMenuOpen: boolean
  review: WrittenReview
  onCloseMenu: () => void
  onDelete: () => void
  onEdit: () => void
  onOpenDetail: () => void
  onToggleMenu: () => void
}

export const WrittenReviewCard = ({
  isMenuOpen,
  review,
  onCloseMenu,
  onDelete,
  onEdit,
  onOpenDetail,
  onToggleMenu,
}: WrittenReviewCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const menuId = useId()
  const menuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (menuContainerRef.current?.contains(event.target as Node)) {
        return
      }

      onCloseMenu()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      onCloseMenu()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen, onCloseMenu])

  const handleEdit = () => {
    onCloseMenu()
    onEdit()
  }

  const handleDeleteClick = () => {
    onCloseMenu()
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    onDelete()
    setIsDeleteDialogOpen(false)
  }

  return (
    <article className="border-warm-gray-50 flex h-[120px] min-w-0 items-center gap-3 border-b">
      <button
        aria-label={`${review.restaurantName} 리뷰 상세 보기`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={onOpenDetail}
        type="button"
      >
        <ReviewImagePlaceholder />
        <div className="min-w-0 flex-1">
          <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2 min-w-0 flex-1">
            {review.restaurantName}
          </h2>
          <p className="typo-body-7 text-cool-gray-500 mt-2">
            {review.visitedAt}
          </p>
          <StarRating className="mt-0.5" size="sm" value={review.rating} />
        </div>
      </button>
      <div
        ref={menuContainerRef}
        className="relative mt-3.5 flex size-[18px] shrink-0 items-center justify-center self-start"
      >
        <button
          aria-controls={isMenuOpen ? menuId : undefined}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label={`${review.restaurantName} 리뷰 메뉴 열기`}
          className="text-warm-gray-300 flex size-[18px] items-center justify-center"
          onClick={onToggleMenu}
          type="button"
        >
          <MenuIcon className="size-[18px]" />
        </button>
        {isMenuOpen ? (
          <ReviewMoreMenu
            id={menuId}
            onDelete={handleDeleteClick}
            onEdit={handleEdit}
          />
        ) : null}
      </div>
      <Dialog.Root
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
        type="alertdialog"
      >
        <ReviewDeleteConfirmDialog onDelete={handleConfirmDelete} />
      </Dialog.Root>
    </article>
  )
}

interface ReviewMoreMenuProps {
  id: string
  onDelete: () => void
  onEdit: () => void
}

const ReviewMoreMenu = ({ id, onDelete, onEdit }: ReviewMoreMenuProps) => {
  return (
    <div
      className="border-warm-gray-100 z-floating absolute top-[calc(100%+12px)] right-0 h-20 w-[140px] rounded-[10px] border bg-white px-2.5"
      id={id}
      role="menu"
    >
      <button
        className="typo-sub-header-2 border-warm-gray-50 text-primary-200 h-10 w-full border-b text-center"
        onClick={onEdit}
        role="menuitem"
        type="button"
      >
        수정하기
      </button>
      <button
        className="typo-sub-header-2 text-primary-400 h-10 w-full text-center"
        onClick={onDelete}
        role="menuitem"
        type="button"
      >
        삭제하기
      </button>
    </div>
  )
}
