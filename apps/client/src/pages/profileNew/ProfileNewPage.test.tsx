import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { requestOnboarding } from '@/pages/profileNew/api/requestOnboarding'
import { uploadProfileImage } from '@/pages/profileNew/api/uploadProfileImage'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  setOnboardingSession,
} from '@/shared/auth/authSession'
import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'
import { createQueryClient } from '@/shared/lib/queryClient'
import { DEFAULT_ERROR_MESSAGE } from '@/shared/api/errorPresentation'

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

const renderProfileNewPage = (ui = <ProfileNewPage />) => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

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
    clearAuthSession()
  })

  it.each(['upload', 'onboarding'] as const)(
    'keeps the draft and preview and allows retry after %s fails',
    async (failureStage) => {
      vi.stubGlobal('URL', {
        ...URL,
        createObjectURL: vi.fn(() => 'blob:profile-preview'),
        revokeObjectURL: vi.fn(),
      })
      const file = new File(['profile'], 'profile.png', { type: 'image/png' })
      mockedUploadProfileImage.mockResolvedValue('users/15/profile/profile.png')
      mockedRequestOnboarding.mockResolvedValue({
        userId: 15,
        accessToken: 'access-token',
      })
      if (failureStage === 'upload') {
        mockedUploadProfileImage.mockRejectedValueOnce(
          new Error('upload failed'),
        )
      } else {
        mockedRequestOnboarding.mockRejectedValueOnce(
          createErrorResponse('COMMON-500', 500, 'server failed'),
        )
      }
      renderProfileNewPage()
      fillValidProfileForm()
      fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
        target: { files: [file] },
      })
      fireEvent.click(screen.getByRole('button', { name: '완료' }))

      expect(
        await screen.findByText(
          failureStage === 'upload' ? DEFAULT_ERROR_MESSAGE : '서버 오류입니다',
        ),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('닉네임')).toHaveValue('하시')
      expect(screen.getByLabelText('연락처')).toHaveValue('010-1234-5678')
      expect(screen.getByLabelText('이메일')).toHaveValue('hashi@example.com')
      expect(screen.getByLabelText('생년월일')).toHaveValue('1998/05/12')
      expect(
        screen.getByRole('img', { name: '프로필 이미지' }),
      ).toHaveAttribute('src', 'blob:profile-preview')
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: '완료' })).toBeEnabled()
      if (failureStage === 'upload')
        expect(mockedRequestOnboarding).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: '완료' }))
      await waitFor(() => expect(getAccessToken()).toBe('access-token'))
      expect(mockedUploadProfileImage).toHaveBeenCalledTimes(
        failureStage === 'upload' ? 2 : 1,
      )
    },
  )

  it('rejects profile image files larger than 5MB and keeps the current image', () => {
    const createObjectUrl = vi.fn(() => 'blob:oversized-profile-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })
    renderProfileNewPage()

    const oversizedImageFile = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      'oversized-profile.png',
      { type: 'image/png' },
    )
    fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
      target: { files: [oversizedImageFile] },
    })

    expect(createObjectUrl).not.toHaveBeenCalled()
    expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument()
    expect(
      screen.getByText('5MB 이하의 이미지만 등록해주세요.'),
    ).toBeInTheDocument()
  })

  it('enables submit after required values are valid and navigates home after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    renderProfileNewPage()

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
    expect(getAccessToken()).toBe('onboarding-access-token')
    expect(getAuthSessionStatus()).toBe('authenticated')
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
    mockedRequestOnboarding.mockResolvedValue({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    renderProfileNewPage()

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

  it('reuses the uploaded profile image key when onboarding validation is retried with the same file', async () => {
    const imageFile = new File(['profile'], 'profile.png', {
      type: 'image/png',
    })
    mockedUploadProfileImage.mockResolvedValue('users/15/profile/profile.png')
    mockedRequestOnboarding
      .mockRejectedValueOnce(
        createErrorResponse('USER-001', 409, '중복된 닉네임입니다'),
      )
      .mockResolvedValueOnce({
        userId: 15,
        accessToken: 'onboarding-access-token',
      })
    renderProfileNewPage()

    fillValidProfileForm()
    fireEvent.change(screen.getByLabelText('프로필 이미지 파일 선택'), {
      target: { files: [imageFile] },
    })
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(await screen.findByText('중복된 닉네임입니다')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '새하시' },
    })
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockedRequestOnboarding).toHaveBeenCalledTimes(2)
    })
    expect(mockedUploadProfileImage).toHaveBeenCalledTimes(1)
  })

  it('shows nickname field error when onboarding API responds with USER-001', async () => {
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('USER-001', 409, '중복된 닉네임입니다'),
    )
    renderProfileNewPage()

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
    renderProfileNewPage()

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(
      await screen.findByText(
        '연락처는 하이픈 없이 숫자 10~11자리로 입력해주세요',
      ),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows the nameEng validation reason under the English name field', async () => {
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('COMMON-400', 400, '잘못된 요청입니다', [
        {
          field: 'nameEng',
          rejectedValue: 'HASHI ENGLISH NAME OVER LIMIT',
          reason: '영문 이름은 20자 이하로 입력해주세요',
        },
      ]),
    )
    renderProfileNewPage()

    fillValidProfileForm()
    fireEvent.change(screen.getByLabelText('영문 이름 (선택)'), {
      target: { value: 'HASHI' },
    })
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(
      await screen.findByText('영문 이름은 20자 이하로 입력해주세요'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('영문 이름 (선택)')).toHaveAttribute(
      'aria-describedby',
      'profile-english-name-error',
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a form error when onboarding API responds with USER-004', async () => {
    mockedRequestOnboarding.mockRejectedValue(
      createErrorResponse('USER-004', 409, '이미 사용 중인 가입 정보입니다'),
    )
    renderProfileNewPage()

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(
      await screen.findByText('이미 사용 중인 가입 정보입니다'),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it.each([
    ['COMMON-401', 401, '인증이 필요합니다'],
    ['COMMON-403', 403, '권한이 없습니다'],
  ])(
    'clears onboarding session and redirects to login-required for %s',
    async (code, status, message) => {
      setOnboardingSession()
      mockedRequestOnboarding.mockRejectedValue(
        createErrorResponse(code, status, message),
      )
      renderProfileNewPage()

      fillValidProfileForm()
      fireEvent.click(screen.getByRole('button', { name: '완료' }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.loginRequired, {
          replace: true,
        })
      })
      expect(getAuthSessionStatus()).toBe('unauthenticated')
    },
  )

  it('prevents duplicate onboarding requests while submit is pending', async () => {
    mockedRequestOnboarding.mockImplementation(
      () =>
        new Promise(() => {
          // Keep the request pending to verify duplicate prevention.
        }),
    )
    renderProfileNewPage()

    fillValidProfileForm()
    const submitButton = screen.getByRole('button', { name: '완료' })

    fireEvent.click(submitButton)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockedRequestOnboarding).toHaveBeenCalledTimes(1)
    })
  })

  it('disables profile fields and image actions while submit is pending', async () => {
    mockedRequestOnboarding.mockImplementation(
      () =>
        new Promise(() => {
          // Keep the request pending while asserting the locked form state.
        }),
    )
    renderProfileNewPage()

    fillValidProfileForm()
    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockedRequestOnboarding).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByLabelText('닉네임')).toBeDisabled()
    expect(screen.getByLabelText('생년월일')).toBeDisabled()
    expect(screen.getByLabelText('연락처')).toBeDisabled()
    expect(screen.getByLabelText('영문 이름 (선택)')).toBeDisabled()
    expect(screen.getByLabelText('이메일')).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '프로필 이미지 수정' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: '프로필 삭제' })).toBeDisabled()
    expect(screen.getByLabelText('프로필 이미지 파일 선택')).toBeDisabled()
  })

  it('navigates to an allowed redirectTo path after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    mockSearchParams.set('redirectTo', '/restaurants/1/reviews/new')
    renderProfileNewPage()

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/restaurants/1/reviews/new')
    })
  })

  it('preserves search and hash on an allowed redirectTo path after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    mockSearchParams.set(
      'redirectTo',
      '/restaurants/1/reviews/new?reservationId=1#review-form',
    )
    renderProfileNewPage()

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/restaurants/1/reviews/new?reservationId=1#review-form',
      )
    })
  })

  it('ignores unsupported internal redirectTo paths after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    mockSearchParams.set('redirectTo', ROUTES.withdrawal)
    renderProfileNewPage()

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
    })
  })

  it('ignores external redirectTo URLs after onboarding succeeds', async () => {
    mockedRequestOnboarding.mockResolvedValue({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    mockSearchParams.set('redirectTo', 'https://example.com/reviews/new')
    renderProfileNewPage()

    fillValidProfileForm()

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
    })
  })
})
