import '@testing-library/jest-dom/vitest'
import { showToast } from '@hashi/hds-ui'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FriendInvitePage } from '@/pages/friendInvite/FriendInvitePage'
import { copyTextToClipboard } from '@/shared/utils'

vi.mock('@/shared/utils', async () => ({
  ...(await vi.importActual<typeof import('@/shared/utils')>('@/shared/utils')),
  copyTextToClipboard: vi.fn().mockResolvedValue(true),
}))
vi.mock('@hashi/hds-ui', async () => ({
  ...(await vi.importActual<typeof import('@hashi/hds-ui')>('@hashi/hds-ui')),
  showToast: vi.fn(),
}))
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )),
  useNavigate: () => vi.fn(),
}))

const setShare = (share: Navigator['share'] | undefined) => {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    value: share,
  })
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  setShare(undefined)
})

describe('FriendInvitePage', () => {
  it('복사 버튼을 누르면 초대코드를 복사하고 토스트를 보여준다', async () => {
    render(<FriendInvitePage />)

    fireEvent.click(screen.getByRole('button', { name: '복사' }))

    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1))
    expect(copyTextToClipboard).toHaveBeenCalledWith('HASHI7A2')
  })

  it('공유를 지원하면 초대 링크를 공유 시트로 보낸다', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    setShare(share)
    render(<FriendInvitePage />)

    fireEvent.click(screen.getByRole('button', { name: '초대 링크 공유' }))

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    expect(share.mock.calls[0][0].url).toContain('inviteCode=HASHI7A2')
    expect(copyTextToClipboard).not.toHaveBeenCalled()
  })

  it('공유 시트를 닫으면 링크를 복사하지 않는다', async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException('canceled', 'AbortError'))
    setShare(share)
    render(<FriendInvitePage />)

    fireEvent.click(screen.getByRole('button', { name: '초대 링크 공유' }))

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    expect(copyTextToClipboard).not.toHaveBeenCalled()
  })

  it('공유를 지원하지 않으면 초대 링크를 복사하고 토스트를 보여준다', async () => {
    render(<FriendInvitePage />)

    fireEvent.click(screen.getByRole('button', { name: '초대 링크 공유' }))

    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1))
    expect(copyTextToClipboard).toHaveBeenCalledWith(
      expect.stringContaining('inviteCode=HASHI7A2'),
    )
  })
})
