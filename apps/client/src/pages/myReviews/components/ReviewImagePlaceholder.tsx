import { DefaultImage } from '@/shared/components/defaultImage'

export const ReviewImagePlaceholder = () => {
  return (
    <DefaultImage
      aria-hidden="true"
      data-testid="my-review-default-image"
      className="size-[92px] shrink-0 rounded-[5px]"
      logoSize="sm"
    />
  )
}
