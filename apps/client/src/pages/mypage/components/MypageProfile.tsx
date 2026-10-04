import { Avatar, Button } from '@hashi/hds-ui'

type MypageProfileProps = {
  nickname: string
  onEdit: () => void
  profileImageUrl?: string | null
}

export const MypageProfile = ({
  nickname,
  onEdit,
  profileImageUrl,
}: MypageProfileProps) => {
  return (
    <section className="mx-1.5 mb-8 flex items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Avatar
          alt={`${nickname} 프로필 이미지`}
          size="md"
          src={profileImageUrl ?? undefined}
        />
        <h1 className="typo-header-1 text-cool-gray-900 truncate">
          {nickname}님
        </h1>
      </div>
      <Button
        className="shrink-0 px-[12.5px]"
        onClick={onEdit}
        size="sm"
        type="button"
      >
        수정
      </Button>
    </section>
  )
}
