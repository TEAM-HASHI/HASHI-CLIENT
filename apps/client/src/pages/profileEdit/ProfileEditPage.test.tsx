import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ProfileEditPage } from '@/pages/profileEdit/ProfileEditPage'

const { mockNavigate, mockRequest } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockRequest: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/shared/api/request', () => ({
  request: mockRequest,
}))

const renderProfileEditPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileEditPage />
    </QueryClientProvider>,
  )
}

describe('ProfileEditPage', () => {
  beforeEach(() => {
    mockRequest.mockResolvedValue({
      nickname: '하시',
      profileImageUrl: 'https://example.com/profile.png',
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows the current profile summary as initial values', async () => {
    renderProfileEditPage()

    expect(
      await screen.findByRole('heading', { name: '내 정보 수정' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('닉네임')).toHaveValue('하시')
    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      'https://example.com/profile.png',
    )
    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled()
  })

  it('enables save after a valid change and explains that saving is not available yet', async () => {
    renderProfileEditPage()

    await screen.findByDisplayValue('하시')

    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })

    const saveButton = screen.getByRole('button', { name: '저장하기' })
    expect(saveButton).toBeEnabled()

    fireEvent.click(saveButton)

    expect(
      screen.getByRole('dialog', { name: '서비스를 준비하고 있어요.' }),
    ).toBeInTheDocument()
  })

  it('returns to the previous page from the header', async () => {
    renderProfileEditPage()

    fireEvent.click(await screen.findByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
