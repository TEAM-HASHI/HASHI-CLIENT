import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import { uploadProfileImage } from '@/pages/profileNew/api/uploadProfileImage'
import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import profileEmptyImage from '@/shared/assets/images/profile-empty.svg'

import { ProfileNewPage } from '@/pages/profileNew/ProfileNewPage'

const { mockNavigate, mockSearchParams } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSearchParams: new URLSearchParams(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  }
})

vi.mock('@/pages/profileNew/api/requestOnboarding', () => ({
  requestOnboarding: vi.fn(),
}))

vi.mock('@/pages/profileNew/api/uploadProfileImage', () => ({
  uploadProfileImage: vi.fn(),
}))

const mockedRequestOnboarding = vi.mocked(requestOnboarding)
const mockedUploadProfileImage = vi.mocked(uploadProfileImage)

const fillValidProfileForm = () => {
  fireEvent.change(screen.getByLabelText('닉네임'), {
    target: { value: '하시' },
  })
  fireEvent.change(screen.getByLabelText('생년월일'), {
    target: { value: '19980512' },
  })
  fireEvent.change(screen.getByLabelText('연락처'), {
    target: { value: '01012345678' },
  })
  fireEvent.change(screen.getByLabelText('이메일'), {
    target: { value: 'hashi@example.com' },
  })
}

const createErrorResponse = (
  code: string,
  status: number,
  message: string,
  errors?: ErrorResponse['errors'],
): ApiError =>
  new ApiError(
    {
      success: false,
      code,
      message,
      data: null,
      timestamp: '2026-07-14T00:00:00.000Z',
      path: '/api/v1/users/onboarding',
      ...(errors ? { errors } : {}),
    },
    status,
  )

describe('ProfileNewPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    mockedRequestOnboarding.mockReset()
    mockedUploadProfileImage.mockReset()
    mockSearchParams.delete('redirectTo')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('keeps the complete CTA disabled before required values are valid', () => {
    render(<ProfileNewPage />)

    expect(screen.getByRole('heading', { name: '프로필 생성' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '완료' })).toBeDisabled()
  })

  it('fixes the header wrapper inside the mobile app frame with the shared utility', () => {
    render(<ProfileNewPage />)

    const backButton = screen.getByRole('button', { name: '뒤로가기' })
    const header = backButton.closest('header')
    const fixedHeaderWrapper = header?.parentElement

    expect(header).toHaveClass('relative')
    expect(fixedHeaderWrapper).toHaveClass(
      'app-mobile-fixed-top',
      'z-fixed',
      'bg-white',
    )
  })

  it('shows the default profile image before and after deleting profile image', () => {
    render(<ProfileNewPage />)

    const profileImage = screen.getByRole('img', { name: '프로필 이미지' })

    expect(profileImage).toHaveAttribute('src', profileEmptyImage)

    fireEvent.click(screen.getByRole('button', { name: '프로필 삭제' }))

    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      profileEmptyImage,
    )
  })

  it('opens the profile image file input from the edit button and previews the selected image', () => {
    const createObjectUrl = vi.fn(() => 'blob:profile-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })
    const inputClick = vi.spyOn(HTMLInputElement.prototype, 'click')
    render(<ProfileNewPage />)

    fireEvent.click(screen.getByRole('button', { name: '프로필 이미지 수정' }))

    expect(inputClick).toHaveBeenCalled()

    const imageFile = new File(['profile'], 'profile.png', {
      type: 'image/png',
    })
    fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
      target: { files: [imageFile] },
    })

    expect(screen.getByLabelText('프로필 이미지 파일 선택')).toHaveValue('')
    expect(createObjectUrl).toHaveBeenCalledWith(imageFile)
    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      'blob:profile-preview',
    )
  })

  it('rejects profile image files larger than 5MB and keeps the current image', () => {
    const createObjectUrl = vi.fn(() => 'blob:oversized-profile-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })
    render(<ProfileNewPage />)

    const oversizedImageFile = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'oversized-profile.png',
      { type: 'image/png' },
    )
    fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
      target: { files: [oversizedImageFile] },
    })

    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      profileEmptyImage,
    )
    expect(screen.getByText('5MB 이하의 이미지만 등록해주세요.')).toHaveClass(
      'typo-body-3',
      'text-error',
      'mt-3',
    )
  })

  it('does not block submit with the old duplicated nickname mock list', async () => {
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '중복' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '19980512' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })

    expect(screen.queryByText('중복된 네이밍입니다.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockedRequestOnboarding).toHaveBeenCalledWith({
        nickname: '중복',
        birthDate: '1998-05-12',
        phone: '01012345678',
        email: 'hashi@example.com',
      })
    })
  })

  it('enables submit after required values are valid and navigates home after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    render(<ProfileNewPage />)

    fillValidProfileForm()

    const submitButton = screen.getByRole('button', { name: '완료' })

    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockedRequestOnboarding).toHaveBeenCalledWith({
        nickname: '하시',
        birthDate: '1998-05-12',
        phone: '01012345678',
        email: 'hashi@example.com',
      })
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
    })
  })

  it('uploads the selected profile image and sends the file key in onboarding body', async () => {
    const createObjectUrl = vi.fn(() => 'blob:profile-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })
    const imageFile = new File(['profile'], 'profile.png', {
      type: 'image/png',
    })
    mockedUploadProfileImage.mockResolvedValue('users/15/profile/profile.png')
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    render(<ProfileNewPage />)

    fillValidProfileForm()
    fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
      target: { files: [imageFile] },
    })
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockedUploadProfileImage).toHaveBeenCalledWith(imageFile)
      expect(mockedRequestOnboarding).toHaveBeenCalledWith({
        nickname: '하시',
        birthDate: '1998-05-12',
        phone: '01012345678',
        email: 'hashi@example.com',
        profileImageKey: 'users/15/profile/profile.png',
      })
    })
  })

  it('shows nickname field error when onboarding API responds with USER-001', async () => {
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('USER-001', 409, '중복된 닉네임입니다'),
    )
    render(<ProfileNewPage />)

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(await screen.findByText('중복된 닉네임입니다')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows validation field reason when onboarding API responds with COMMON-400 errors', async () => {
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('COMMON-400', 400, '잘못된 요청입니다', [
        {
          field: 'phone',
          rejectedValue: '010-1234-5678',
          reason: '연락처는 하이픈 없이 숫자 10~11자리로 입력해주세요',
        },
      ]),
    )
    render(<ProfileNewPage />)

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(
      await screen.findByText(
        '연락처는 하이픈 없이 숫자 10~11자리로 입력해주세요',
      ),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a form error when onboarding API responds with USER-004', async () => {
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('USER-004', 409, '이미 사용 중인 가입 정보입니다'),
    )
    render(<ProfileNewPage />)

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(
      await screen.findByText('이미 사용 중인 가입 정보입니다'),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('throws onboarding auth errors to the route error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('COMMON-401', 401, '인증이 필요합니다'),
    )
    render(
      <ErrorBoundary fallback={<p role="alert">boundary error</p>}>
        <ProfileNewPage />
      </ErrorBoundary>,
    )

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('boundary error')
  })

  it('prevents duplicate onboarding requests while submit is pending', async () => {
    mockedRequestOnboarding.mockImplementation(
      () =>
        new Promise(() => {
          // Keep the request pending to verify duplicate prevention.
        }),
    )
    render(<ProfileNewPage />)

    fillValidProfileForm()
    const submitButton = screen.getByRole('button', { name: '완료' })

    fireEvent.click(submitButton)
    fireEvent.click(submitButton)

    expect(mockedRequestOnboarding).toHaveBeenCalledTimes(1)
  })

  it('navigates to an allowed redirectTo path after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    mockSearchParams.set('redirectTo', '/restaurants/1/reviews/new')
    render(<ProfileNewPage />)

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/restaurants/1/reviews/new')
    })
  })

  it('preserves search and hash on an allowed redirectTo path after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    mockSearchParams.set(
      'redirectTo',
      '/restaurants/1/reviews/new?reservationId=1#review-form',
    )
    render(<ProfileNewPage />)

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/restaurants/1/reviews/new?reservationId=1#review-form',
      )
    })
  })

  it('ignores unsupported internal redirectTo paths after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    mockSearchParams.set('redirectTo', ROUTES.withdrawal)
    render(<ProfileNewPage />)

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
    })
  })

  it('ignores external redirectTo URLs after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({ userId: 15 })
    mockSearchParams.set('redirectTo', 'https://example.com/reviews/new')
    render(<ProfileNewPage />)

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
    })
  })

  it('formats birth date and phone number while typing', () => {
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })

    expect(screen.getByLabelText('생년월일')).toHaveValue('2026/07/08')
    expect(screen.getByLabelText('연락처')).toHaveValue('010-1234-5678')
  })

  it('moves back to the previous history entry from the header action', () => {
    render(<ProfileNewPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
