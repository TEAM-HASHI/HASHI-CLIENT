import { BackIcon, CopyIcon, LinkIcon } from '@hashi/hds-icons'
import {
  Button,
  Header,
  IconButton,
  showToast,
  toastQueue,
} from '@hashi/hds-ui'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import inviteCodeUrl from '@/pages/friendInvite/assets/invite-code.svg'
import inviteLinkUrl from '@/pages/friendInvite/assets/invite-link.svg'
import pointCoinsUrl from '@/pages/friendInvite/assets/invite-point-coins.svg'
import { PageFixedArea } from '@/shared/components/pageFixedArea/PageFixedArea'
import { copyTextToClipboard } from '@/shared/utils'

// TODO: 내 초대코드 조회 API가 나오면 교체한다. 지금은 Figma 예시 값이다.
const MOCK_INVITE_CODE = 'HASHI7A2'

// TODO: 초대 링크 형식이 기획에서 확정되면 교체한다.
const getInviteUrl = (inviteCode: string) =>
  `${window.location.origin}/?inviteCode=${encodeURIComponent(inviteCode)}`

const showCopiedToast = (icon: ReactNode, message: string) => {
  toastQueue.clear()
  showToast({ icon, children: message })
}

const GUIDE_STEPS: { iconUrl: string; text: ReactNode }[] = [
  {
    iconUrl: inviteLinkUrl,
    text: '내 코드나 초대 링크를 친구에게 보내요.',
  },
  {
    iconUrl: inviteCodeUrl,
    text: '친구가 가입할 때 초대자 코드를 입력해요.',
  },
  {
    iconUrl: pointCoinsUrl,
    text: (
      <>
        친구의 첫 예약 결제 완료 시, 두 분께{' '}
        <span className="text-primary-400 whitespace-nowrap">각각 4,000P</span>
        를 드려요.
      </>
    ),
  },
]

export const FriendInvitePage = () => {
  const navigate = useNavigate()
  const inviteCode = MOCK_INVITE_CODE

  const handleCopyCode = async () => {
    if (await copyTextToClipboard(inviteCode)) {
      showCopiedToast(
        <CopyIcon className="size-6" />,
        '초대코드가 복사되었어요.',
      )
    }
  }

  const handleShareLink = async () => {
    const url = getInviteUrl(inviteCode)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HASHI 친구 초대',
          text: '친구도 나도 각각 4,000P',
          url,
        })
        return
      } catch (error) {
        // 사용자가 공유 시트를 닫은 경우는 실패가 아니다.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    if (await copyTextToClipboard(url)) {
      showCopiedToast(
        <LinkIcon className="size-6" />,
        '초대 링크가 복사되었어요.',
      )
    }
  }

  return (
    <div className="min-h-dvh bg-white pt-18.75">
      <PageFixedArea>
        <Header
          className="app-mobile-fixed-top z-fixed fixed"
          leftAction={
            <IconButton
              aria-label="뒤로가기"
              onClick={() =>
                window.history.state?.idx > 0
                  ? navigate(-1)
                  : navigate(ROUTES.mypage, { replace: true })
              }
              size="xs"
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          title="친구 초대"
        />
      </PageFixedArea>

      <div className="text-cool-gray-900 px-5 pt-11 pb-10">
        <h1 className="typo-header-1 whitespace-pre-line">
          {'친구도 나도,\n각각 4,000P'}
        </h1>
        <p className="typo-body-7 mt-3 whitespace-pre-line text-[#737a7d]">
          {
            '초대받은 친구가 첫 예약 결제를 완료하면\n초대한 분과 친구 모두에게 4,000P를 드려요.\n\n다음 예약의 대행 수수료로 사용해보세요.'
          }
        </p>

        <section className="bg-primary-100 mt-9 flex flex-col gap-3.75 rounded-[12px] px-5 py-3.75">
          <h2 className="typo-body-6 leading-5.25">내 초대코드</h2>
          <div className="flex h-12 items-center justify-between gap-3">
            <span className="truncate text-[26px] font-semibold">
              {inviteCode}
            </span>
            <Button className="w-18.75 shrink-0" onClick={handleCopyCode}>
              복사
            </Button>
          </div>
        </section>

        <Button className="mt-6.25" onClick={handleShareLink} width="full">
          초대 링크 공유
        </Button>

        <section className="mt-12 px-1">
          <h2 className="typo-body-6 leading-[1.36]">
            포인트는 이렇게 받아요!
          </h2>
          <ol className="mt-3.5 flex flex-col gap-3.25">
            {GUIDE_STEPS.map((step, index) => (
              <li className="flex items-center gap-2.5" key={index}>
                <img
                  alt=""
                  className="size-10.75 shrink-0"
                  src={step.iconUrl}
                />
                <span className="typo-body-3 break-keep">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
