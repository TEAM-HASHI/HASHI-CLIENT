import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createCollection } from '@/pages/saved/api/createCollection'
import { updateCollection } from '@/pages/saved/api/updateCollection'

const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }))
vi.mock('@/shared/api/request', () => ({ request: mockRequest }))

describe('collection form write contracts', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('sends explicit visibility and preserves the input for server normalization', async () => {
    const body = { name: '  여행  맛집  ', color: 'red', visibility: 'private' }
    const detail = { collectionId: 42, name: '여행  맛집', owner: true }
    mockRequest.mockResolvedValue(detail)

    await expect(createCollection(body)).resolves.toBe(detail)
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/collections', {
      method: 'post',
      json: body,
    })
  })

  it('does not turn a visibility-only patch into a replacement of the other fields', async () => {
    const detail = { collectionId: 42, visibility: 'public' }
    mockRequest.mockResolvedValue(detail)
    await expect(updateCollection(42, { visibility: 'public' })).resolves.toBe(
      detail,
    )
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/collections/42', {
      method: 'patch',
      json: { visibility: 'public' },
    })
  })

  it('preserves an empty description so PATCH can delete it', async () => {
    mockRequest.mockResolvedValue({ collectionId: 42, description: null })
    await updateCollection(42, { description: '' })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/collections/42', {
      method: 'patch',
      json: { description: '' },
    })
  })

  it('rejects missing or mismatched returned identity instead of inventing a collection', async () => {
    mockRequest.mockResolvedValue(null)
    await expect(
      createCollection({ name: '여행', color: 'red', visibility: 'public' }),
    ).rejects.toThrow('response')
    mockRequest.mockResolvedValue({ collectionId: 99 })
    await expect(updateCollection(42, { name: '여행' })).rejects.toThrow(
      'response',
    )
  })

  it('preserves duplicate-name failures for local form handling without retrying', async () => {
    const error = Object.assign(new Error('duplicate name'), {
      code: 'USER-007',
      status: 409,
    })
    mockRequest.mockRejectedValue(error)
    await expect(
      createCollection({ name: '여행', color: 'red', visibility: 'public' }),
    ).rejects.toBe(error)
    expect(mockRequest).toHaveBeenCalledTimes(1)
  })

  it('rejects an invalid path ID before writing', async () => {
    await expect(updateCollection(0, { name: '여행' })).rejects.toThrow(
      'collectionId',
    )
    expect(mockRequest).not.toHaveBeenCalled()
  })
})
