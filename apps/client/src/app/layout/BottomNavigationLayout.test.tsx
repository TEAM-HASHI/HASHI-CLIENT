import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { BottomNavigationLayout } from '@/app/layout/BottomNavigationLayout'
const State = () => {
  const location = useLocation()
  return <output>{JSON.stringify(location.state)}</output>
}
afterEach(cleanup)
it('only emits a reset when reselecting the active map tab', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<BottomNavigationLayout />}>
          <Route path="*" element={<State />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: '지도' }))
  expect(screen.getByRole('status')).toHaveTextContent('null')
  fireEvent.click(screen.getByRole('button', { name: '지도' }))
  expect(screen.getByRole('status')).toHaveTextContent('resetMap')
})
