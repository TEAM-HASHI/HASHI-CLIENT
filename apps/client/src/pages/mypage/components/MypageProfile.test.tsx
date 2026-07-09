import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MypageProfile } from '@/pages/mypage/components/MypageProfile'

describe('MypageProfile', () => {
  it('disables the MVP-excluded profile edit button', () => {
    render(<MypageProfile nickname="하시" profileImageUrl={null} />)

    expect(screen.getByRole('button', { name: '수정' })).toBeDisabled()
  })
})
