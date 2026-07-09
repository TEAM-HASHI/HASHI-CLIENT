import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { MyReviewEmptyState } from '@/pages/myReviews/components/MyReviewEmptyState'
import { MyReviewTabs } from '@/pages/myReviews/components/MyReviewTabs'
import { MyReviewTotalCount } from '@/pages/myReviews/components/MyReviewTotalCount'
import { ReviewWritableCard } from '@/pages/myReviews/components/ReviewWritableCard'
import { WrittenReviewCard } from '@/pages/myReviews/components/WrittenReviewCard'
import { MY_REVIEW_TAB_ITEMS } from '@/pages/myReviews/constants/myReviewTabs'
import { useMyReviewsPage } from '@/pages/myReviews/hooks/useMyReviewsPage'

export const MyReviewsPage = () => {
  const {
    activeTab,
    openedMenuReviewId,
    tabItems,
    writableReviews,
    writtenReviews,
    handleBack,
    handleChangeTab,
    handleCloseReviewMenu,
    handleDeleteReview,
    handleNavigateToReviewEdit,
    handleNavigateToReviewNew,
    handleNavigateToTodayRestaurant,
    handleToggleReviewMenu,
  } = useMyReviewsPage()

  const isWritableTab = activeTab === MY_REVIEW_TAB_ITEMS.writable.value
  const currentCount = isWritableTab
    ? writableReviews.length
    : writtenReviews.length
  const isEmpty = currentCount === 0

  return (
    <section className="min-h-dvh min-w-0 overflow-x-hidden bg-white">
      <Header
        leftAction={
          <IconButton aria-label="뒤로가기" onClick={handleBack} size="xs">
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="마이 리뷰"
      />
      <MyReviewTabs
        items={tabItems}
        onChange={handleChangeTab}
        value={activeTab}
      />

      {isEmpty ? (
        <MyReviewEmptyState
          message={
            isWritableTab
              ? '최근 방문한 맛집이 없어요.'
              : '작성한 리뷰가 없어요.'
          }
          onClick={handleNavigateToTodayRestaurant}
        />
      ) : (
        <main className="min-w-0 px-5">
          <MyReviewTotalCount count={currentCount} />
          {isWritableTab ? (
            <div className="flex min-w-0 flex-col gap-5">
              {writableReviews.map((review) => (
                <ReviewWritableCard
                  key={review.id}
                  review={review}
                  onClick={() => handleNavigateToReviewNew(review.restaurantId)}
                />
              ))}
            </div>
          ) : (
            <div className="min-w-0">
              {writtenReviews.map((review) => (
                <WrittenReviewCard
                  key={review.id}
                  isMenuOpen={openedMenuReviewId === review.id}
                  review={review}
                  onCloseMenu={handleCloseReviewMenu}
                  onDelete={() => handleDeleteReview(review.id)}
                  onEdit={() => handleNavigateToReviewEdit(review.id)}
                  onToggleMenu={() => handleToggleReviewMenu(review.id)}
                />
              ))}
            </div>
          )}
        </main>
      )}
    </section>
  )
}
