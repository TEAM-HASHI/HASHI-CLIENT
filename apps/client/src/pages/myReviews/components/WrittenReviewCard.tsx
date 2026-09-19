import { MenuIcon } from '@hashi/hds-icons'
import { Dialog, StarRating, Thumbnail } from '@hashi/hds-ui'
import { useEffect, useId, useRef, useState } from 'react'

import { ReviewDeleteConfirmDialog } from '@/features/review/components'
import type { WrittenReview } from '@/pages/myReviews/types/myReview'

interface WrittenReviewCardProps {
  isDeleting: boolean
  isMenuOpen: boolean
  review: WrittenReview
  onCloseMenu: () => void
  onDelete: () => Promise<void>
  onEdit: () => void
  onOpenDetail: () => void
  onToggleMenu: () => void
}

export const WrittenReviewCard = ({
  isDeleting,
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

  const handleConfirmDelete = async () => {
    try {
      await onDelete()
      setIsDeleteDialogOpen(false)
    } catch {
      // The mutation's shared error policy presents the failure to the user.
    }
  }

  return (
    <article className="border-warm-gray-50 relative h-29 min-w-0 border-b">
      <button
        aria-label={`${review.restaurantName} 리뷰 상세 보기`}
        className="focus-visible:outline-cool-gray-500 absolute inset-0 rounded-[5px] focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={onOpenDetail}
        type="button"
      />
      <div className="pointer-events-none flex h-full min-w-0 items-start gap-3 py-3">
        <Thumbnail alt="" size="md" src={review.thumbnailUrl} />
        <div className="flex h-full min-w-0 flex-1 flex-col gap-2 pr-7">
          <div className="flex h-[38px] items-center">
            <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2 min-w-0 flex-1">
              {review.restaurantName}
            </h2>
          </div>
          <div className="flex h-[46px] flex-col gap-0.5">
            <p className="typo-body-7 text-cool-gray-600">{review.visitedAt}</p>
            <StarRating size="sm" value={review.rating} />
          </div>
        </div>
      </div>
      <div
        ref={menuContainerRef}
        className="z-raised absolute top-3 right-0 flex size-[18px] items-center justify-center"
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
        <ReviewDeleteConfirmDialog
          isPending={isDeleting}
          onDelete={handleConfirmDelete}
        />
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
      className="border-warm-gray-100 z-floating absolute top-[22px] right-[7px] h-20 w-[140px] rounded-[10px] border bg-white px-2.5"
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
