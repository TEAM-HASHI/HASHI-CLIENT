import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminSelect } from '@/shared/components/AdminSelect'

describe('AdminSelect', () => {
  it('shows a neutral placeholder for an unknown value', () => {
    render(
      <AdminSelect
        label="장르"
        value=""
        options={[
          { value: 'sushi', label: '스시/사시미류' },
          { value: 'grill', label: '철판/구이류' },
        ]}
        onChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: '장르 선택 항목' }),
    ).toBeInTheDocument()
  })
})
