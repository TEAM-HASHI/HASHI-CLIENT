import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

export interface ReviewHeaderProps {
  onBackClick?: () => void
}

export const ReviewHeader = ({ onBackClick }: ReviewHeaderProps) => {
  return (
    <Header
      title="리뷰 작성"
      leftAction={
        <IconButton aria-label="뒤로가기" size="xs" onClick={onBackClick}>
          <BackIcon className="size-6" />
        </IconButton>
      }
    />
  )
}
