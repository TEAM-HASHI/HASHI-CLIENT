import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { MyReviewTabs } from '@/pages/myReviews/components/MyReviewTabs'
import { MyReviewTotalCount } from '@/pages/myReviews/components/MyReviewTotalCount'
import { MyReviewsErrorState } from '@/pages/myReviews/components/MyReviewsErrorState'
import { ReviewWritableCard } from '@/pages/myReviews/components/ReviewWritableCard'
import { WrittenReviewCard } from '@/pages/myReviews/components/WrittenReviewCard'
import { useMyReviewsPage } from '@/pages/myReviews/hooks/useMyReviewsPage'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { Empty } from '@/shared/components/empty'

export const MyReviewsPage = () => {
  const {
    activeTab,
    currentCount,
    isDeletePending,
    isEditComingSoonDialogOpen,
    isError,
    isFetchingNextPage,
    isPending,
    isWritableTab,
    loadMoreRef,
    openedMenuReviewId,
    pendingDeleteReviewId,
    tabItems,
    writableReviews,
    writtenReviews,
    handleBack,
    handleChangeTab,
    handleCloseReviewMenu,
    handleDeleteReview,
    handleNavigateToReviewDetail,
    handleNavigateToReviewNew,
    handleNavigateToTodayRestaurant,
    handleOpenReviewEditComingSoonDialog,
    handleRetry,
    handleReviewEditComingSoonDialogOpenChange,
    handleToggleReviewMenu,
  } = useMyReviewsPage()

  const currentReviews = isWritableTab ? writableReviews : writtenReviews
  const isEmpty = currentReviews.length === 0

  return (
    <section className="min-h-dvh min-w-0 overflow-x-hidden bg-white">
      <Header
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handleBack} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        className="shadow-none"
        title="마이 리뷰"
      />
      <MyReviewTabs
        items={tabItems}
        onChange={handleChangeTab}
        value={activeTab}
      />

      {isPending ? (
        <p className="typo-body-4 text-primary-200 flex min-h-[360px] items-center justify-center px-5 text-center">
          리뷰 목록을 불러오는 중입니다.
        </p>
      ) : isError ? (
        <MyReviewsErrorState onRetry={handleRetry} />
      ) : isEmpty ? (
        <Empty
          actionLabel="일본 맛집 추천받기"
          className="min-h-[calc(100dvh-115px)] min-w-0 overflow-x-hidden px-5 pb-20"
          description={
            isWritableTab
              ? '최근 방문한 맛집이 없어요.'
              : '작성한 리뷰가 없어요.'
          }
          onAction={handleNavigateToTodayRestaurant}
        />
      ) : (
        <main className="min-w-0 px-5">
          {currentCount !== undefined ? (
            <MyReviewTotalCount count={currentCount} />
          ) : null}
          {isWritableTab ? (
            <div
              className="flex min-w-0 flex-col gap-3"
              data-testid="writable-review-list"
            >
              {writableReviews.map((review) => (
                <ReviewWritableCard
                  key={review.id}
                  review={review}
                  onClick={() =>
                    handleNavigateToReviewNew(
                      review.restaurantId,
                      review.reservationId,
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="min-w-0">
              {writtenReviews.map((review) => (
                <WrittenReviewCard
                  key={review.id}
                  isDeleting={
                    isDeletePending &&
                    pendingDeleteReviewId === Number(review.id)
                  }
                  isMenuOpen={openedMenuReviewId === review.id}
                  review={review}
                  onCloseMenu={handleCloseReviewMenu}
                  onDelete={() => handleDeleteReview(review.id)}
                  onEdit={handleOpenReviewEditComingSoonDialog}
                  onOpenDetail={() => handleNavigateToReviewDetail(review.id)}
                  onToggleMenu={() => handleToggleReviewMenu(review.id)}
                />
              ))}
            </div>
          )}
          <div aria-hidden="true" className="h-px" ref={loadMoreRef} />
          {isFetchingNextPage ? (
            <p className="typo-body-7 text-cool-gray-500 py-4 text-center">
              리뷰를 더 불러오는 중입니다.
            </p>
          ) : null}
        </main>
      )}
      <ComingSoonDialog
        open={isEditComingSoonDialogOpen}
        onOpenChange={handleReviewEditComingSoonDialogOpenChange}
      />
    </section>
  )
}
