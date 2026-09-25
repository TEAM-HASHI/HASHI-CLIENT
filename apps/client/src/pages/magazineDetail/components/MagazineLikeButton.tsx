import { HeartBlankIcon, HeartFillIcon } from '@hashi/hds-icons'

interface MagazineLikeButtonProps {
  count: number
  isLiked: boolean
  onClick: () => void
}

export const MagazineLikeButton = ({
  count,
  isLiked,
  onClick,
}: MagazineLikeButtonProps) => {
  return (
    <button
      aria-pressed={isLiked}
      className="focus-visible:outline-cool-gray-900 inline-flex items-center gap-0.5 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={onClick}
      type="button"
    >
      {isLiked ? (
        <HeartFillIcon aria-hidden="true" className="text-primary-400 size-6" />
      ) : (
        <HeartBlankIcon
          aria-hidden="true"
          className="text-warm-gray-100 size-6"
        />
      )}
      <span className="typo-body-7 text-left text-black">{count}</span>
      <span className="sr-only">
        {isLiked ? '좋아요 취소' : '매거진 좋아요'}
      </span>
    </button>
  )
}
