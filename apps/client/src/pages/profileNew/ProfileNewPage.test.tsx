import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
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

describe('ProfileNewPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    mockSearchParams.delete('redirectTo')
    vi.unstubAllGlobals()
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

  it('shows duplicated nickname error in real time while typing', () => {
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '중복' },
    })

    const errorMessage = screen.getByText('중복된 네이밍입니다.')

    expect(errorMessage).toHaveTextContent('중복된 네이밍입니다.')
    expect(errorMessage).toHaveClass('typo-body-3', 'text-error', 'mt-3')
  })

  it('enables submit after required values are valid and navigates home', () => {
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '하시' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })

    const submitButton = screen.getByRole('button', { name: '완료' })

    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })

  it('navigates to an allowed redirectTo path after valid submit', () => {
    mockSearchParams.set('redirectTo', '/restaurants/1/reviews/new')
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '하시' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/1/reviews/new')
  })

  it('preserves search and hash on an allowed redirectTo path after valid submit', () => {
    mockSearchParams.set(
      'redirectTo',
      '/restaurants/1/reviews/new?reservationId=1#review-form',
    )
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '하시' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/1/reviews/new?reservationId=1#review-form',
    )
  })

  it('ignores unsupported internal redirectTo paths after valid submit', () => {
    mockSearchParams.set('redirectTo', ROUTES.withdrawal)
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '하시' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
  })

  it('ignores external redirectTo URLs after valid submit', () => {
    mockSearchParams.set('redirectTo', 'https://example.com/reviews/new')
    render(<ProfileNewPage />)

    fireEvent.change(screen.getByLabelText('닉네임'), {
      target: { value: '하시' },
    })
    fireEvent.change(screen.getByLabelText('생년월일'), {
      target: { value: '20260708' },
    })
    fireEvent.change(screen.getByLabelText('연락처'), {
      target: { value: '01012345678' },
    })
    fireEvent.change(screen.getByLabelText('이메일'), {
      target: { value: 'hashi@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: '완료' }))

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.home)
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
