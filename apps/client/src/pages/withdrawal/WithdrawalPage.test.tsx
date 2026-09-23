import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { WithdrawalPage } from '@/pages/withdrawal/WithdrawalPage'

describe('WithdrawalPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('enables withdrawal only after the user confirms the notice', () => {
    render(
      <MemoryRouter>
        <WithdrawalPage />
      </MemoryRouter>,
    )

    const withdrawalButton = screen.getByRole('button', { name: '탈퇴하기' })

    expect(withdrawalButton).toBeDisabled()

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: '위 사항을 모두 확인하였고, 탈퇴를 진행합니다.',
      }),
    )

    expect(withdrawalButton).toBeEnabled()

    fireEvent.click(withdrawalButton)

    expect(
      screen.getByRole('dialog', { name: '서비스를 준비하고 있어요.' }),
    ).toBeInTheDocument()
  })
})
