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
      nameEng: 'HASHI',
      birthDate: '1998-05-12',
      phone: '01012345678',
      email: 'hashi@example.com',
      profileImageUrl: 'https://example.com/profile.png',
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows the current profile information as initial values', async () => {
    renderProfileEditPage()

    expect(
      await screen.findByRole('heading', { name: '내 정보 수정' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('닉네임')).toHaveValue('하시')
    expect(screen.getByLabelText('영문 이름 (선택)')).toHaveValue('HASHI')
    expect(screen.getByLabelText('연락처')).toHaveValue('010-1234-5678')
    expect(screen.getByLabelText('이메일')).toHaveValue('hashi@example.com')
    expect(screen.getByLabelText('생년월일')).toHaveValue('1998/05/12')
    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      'https://example.com/profile.png',
    )
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('enables save after a valid change and explains that saving is not available yet', async () => {
    renderProfileEditPage()

    await screen.findByDisplayValue('하시')

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '하시 수정' },
    })

    const saveButton = screen.getByRole('button', { name: '저장' })
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
