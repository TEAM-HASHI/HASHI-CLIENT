import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MypageProfile } from '@/pages/mypage/components/MypageProfile'

describe('MypageProfile', () => {
  afterEach(() => {
    cleanup()
  })

  it('disables the MVP-excluded profile edit button', () => {
    render(<MypageProfile nickname="하시" profileImageUrl={null} />)

    expect(screen.getByRole('button', { name: '수정' })).toBeDisabled()
  })

  it('uses the Avatar guest fallback when profile image is empty', () => {
    render(<MypageProfile nickname="하시" profileImageUrl={null} />)

    expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument()
  })
})
