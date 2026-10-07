import { StrictMode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as HDS from '@hashi/hds-ui'
import { CollectionEditor } from '@/pages/saved/components/CollectionEditor'
import { collectionMocks } from '@/pages/saved/data/collectionMocks'
import { INITIAL_COLLECTION_VIEW } from '@/pages/saved/types'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
describe('CollectionEditor', () => {
  it('StrictMode에서도 공개 공유 미연결 토스트를 한 번만 표시한다', () => {
    const toast = vi.spyOn(HDS, 'showToast').mockReturnValue('toast')
    render(
      <StrictMode>
        <CollectionEditor
          action={{ collectionId: 'spring', type: 'share' }}
          data={collectionMocks}
          view={INITIAL_COLLECTION_VIEW}
          onDataChange={vi.fn()}
          onClose={vi.fn()}
          onDeleted={vi.fn()}
        />
      </StrictMode>,
    )
    expect(toast).toHaveBeenCalledTimes(1)
    expect(toast).toHaveBeenCalledWith({
      icon: expect.anything(),
      children: '링크 복사는 아직 연결되지 않았어요.',
    })
  })
  it('비공개 공유 취소는 데이터 변경을 하지 않는다', () => {
    const change = vi.fn()
    const close = vi.fn()
    render(
      <CollectionEditor
        action={{ collectionId: 'autumn', type: 'share' }}
        data={collectionMocks}
        view={INITIAL_COLLECTION_VIEW}
        onDataChange={change}
        onClose={close}
        onDeleted={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '취소하기' }))
    expect(change).not.toHaveBeenCalled()
    expect(close).toHaveBeenCalledOnce()
  })
})
