import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MypageProfile } from '@/pages/mypage/components/MypageProfile'
import profileEmptyImage from '@/shared/assets/images/profile-empty.svg'

describe('MypageProfile', () => {
  afterEach(() => {
    cleanup()
  })

  it('disables the MVP-excluded profile edit button', () => {
    render(<MypageProfile nickname="하시" profileImageUrl={null} />)

    expect(screen.getByRole('button', { name: '수정' })).toBeDisabled()
  })

  it('uses the profile creation default image when profile image is empty', () => {
    render(<MypageProfile nickname="하시" profileImageUrl={null} />)

    expect(
      screen.getByRole('img', { name: '하시 프로필 이미지' }),
    ).toHaveAttribute('src', profileEmptyImage)
  })
})
