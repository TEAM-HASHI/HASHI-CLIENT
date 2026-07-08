import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import profileEmptyImage from '@/shared/assets/images/profile-empty.svg'

import { ProfileNewPage } from '@/pages/profileNew/ProfileNewPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  }
})

describe('ProfileNewPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    vi.unstubAllGlobals()
  })

  it('keeps the complete CTA disabled before required values are valid', () => {
    render(<ProfileNewPage />)

    expect(screen.getByRole('heading', { name: '프로필 생성' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '완료' })).toBeDisabled()
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

    expect(createObjectUrl).toHaveBeenCalledWith(imageFile)
    expect(screen.getByRole('img', { name: '프로필 이미지' })).toHaveAttribute(
      'src',
      'blob:profile-preview',
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
