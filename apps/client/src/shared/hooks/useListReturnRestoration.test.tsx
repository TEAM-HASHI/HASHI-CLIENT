import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  createListReturnStore,
  useListReturnRestoration,
} from '@/shared/hooks/useListReturnRestoration'

const List = ({
  locationKey,
  ready,
  store,
}: {
  locationKey: string
  ready: boolean
  store: ReturnType<typeof createListReturnStore<string>>
}) => {
  const { capture, scrollRef } = useListReturnRestoration({
    locationKey,
    ready,
    store,
  })

  return (
    <div ref={scrollRef} data-testid="list">
      <button onClick={() => capture('loaded pages')} type="button">
        상세 보기
      </button>
    </div>
  )
}

describe('useListReturnRestoration', () => {
  it('restores only the matching history entry after its list is ready', () => {
    const store = createListReturnStore<string>()
    const firstVisit = render(
      <List locationKey="list-entry" ready store={store} />,
    )
    screen.getByTestId('list').scrollTop = 280
    fireEvent.click(screen.getByRole('button', { name: '상세 보기' }))
    firstVisit.unmount()

    expect(store.read('list-entry')?.data).toBe('loaded pages')

    const returnVisit = render(
      <List locationKey="other-entry" ready store={store} />,
    )
    expect(screen.getByTestId('list').scrollTop).toBe(0)
    returnVisit.rerender(
      <List locationKey="list-entry" ready={false} store={store} />,
    )
    expect(screen.getByTestId('list').scrollTop).toBe(0)
    returnVisit.rerender(<List locationKey="list-entry" ready store={store} />)

    expect(screen.getByTestId('list').scrollTop).toBe(280)
    expect(store.read('list-entry')).toBeNull()
  })
})
