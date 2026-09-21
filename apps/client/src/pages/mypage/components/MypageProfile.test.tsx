import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MypageProfile } from '@/pages/mypage/components/MypageProfile'

describe('MypageProfile', () => {
  afterEach(() => {
    cleanup()
  })

  it('calls the profile edit handler when the edit button is selected', () => {
    const handleEdit = vi.fn()

    render(
      <MypageProfile
        nickname="하시"
        onEdit={handleEdit}
        profileImageUrl={null}
      />,
    )

    screen.getByRole('button', { name: '수정' }).click()

    expect(handleEdit).toHaveBeenCalledOnce()
  })

  it('uses the Avatar guest fallback when profile image is empty', () => {
    render(
      <MypageProfile
        nickname="하시"
        onEdit={() => undefined}
        profileImageUrl={null}
      />,
    )

    expect(screen.getByTestId('avatar-placeholder')).toBeInTheDocument()
  })
})
