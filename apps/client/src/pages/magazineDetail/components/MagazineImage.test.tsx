import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { MagazineImage } from '@/pages/magazineDetail/components/MagazineImage'

afterEach(cleanup)

it('retries a previously failed source after the source changes away and back', () => {
  const { container, rerender } = render(
    <MagazineImage alt="매거진 이미지" src="https://example.com/a.jpg" />,
  )
  fireEvent.error(container.querySelector('img')!)
  expect(container.querySelector('img')).not.toBeInTheDocument()
  rerender(
    <MagazineImage alt="매거진 이미지" src="https://example.com/b.jpg" />,
  )
  expect(container.querySelector('img')).toHaveAttribute(
    'src',
    'https://example.com/b.jpg',
  )
  rerender(
    <MagazineImage alt="매거진 이미지" src="https://example.com/a.jpg" />,
  )
  expect(container.querySelector('img')).toHaveAttribute(
    'src',
    'https://example.com/a.jpg',
  )
})
