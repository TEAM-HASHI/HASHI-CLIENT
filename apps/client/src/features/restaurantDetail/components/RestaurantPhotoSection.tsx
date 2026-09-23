import { ListEmptyState } from '@/shared/components/listEmptyState'

export const RestaurantPhotoSection = () => {
  return (
    <section aria-label="사진" className="px-5 pt-9 pb-9">
      <ListEmptyState description="등록된 사진이 없습니다." />
    </section>
  )
}
