import { expect, it } from 'vitest'
import type { MagazineDetailResponse } from '@/pages/magazineDetail/api/magazineDetailApi'
import { createMagazineDetailViewModel } from '@/pages/magazineDetail/utils/createMagazineDetailViewModel'

it('keeps pending image slots without zipping legacy URLs against a different-length wrapper list', () => {
  const detail: MagazineDetailResponse = {
    magazineId: 1,
    title: '매거진',
    hashtags: [],
    createdAt: '2026-10-17T10:00:00',
    liked: false,
    likeCount: 0,
    restaurants: [],
    cardNewsImageUrls: ['https://example.com/ready.jpg'],
    cardNewsImages: [
      {
        cardNewsId: 2,
        displayOrder: 2,
        image: {
          status: 'READY',
          defaultSource: {
            url: 'https://example.com/ready.jpg',
            width: 400,
            height: 600,
          },
        },
      },
      {
        cardNewsId: 1,
        displayOrder: 1,
        image: { status: 'PROCESSING' },
        legacyUrl: 'https://example.com/stale.jpg',
      },
      {
        cardNewsId: 3,
        displayOrder: 3,
        legacyUrl: 'https://example.com/legacy.jpg',
      },
    ],
  }
  expect(createMagazineDetailViewModel(detail).coverImageUrls).toEqual([
    null,
    'https://example.com/ready.jpg',
    'https://example.com/legacy.jpg',
  ])
  expect(detail.cardNewsImages?.[0].cardNewsId).toBe(2)
})
