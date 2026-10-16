// TODO: 매거진 상세 mock 데이터. 추후 API 연동 시 제거 예정
import type { MagazineDetailPreview } from '@/pages/magazineDetail/types'

const DEFAULT_TITLE = '매거진 상세'

const checkIsRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getPreviewFields = (state: unknown) => {
  if (!checkIsRecord(state)) {
    return undefined
  }

  const preview = state.magazinePreview

  if (!checkIsRecord(preview)) {
    return undefined
  }

  const { imageUrl, title } = preview

  return {
    imageUrl: typeof imageUrl === 'string' ? imageUrl : undefined,
    title: typeof title === 'string' ? title : undefined,
  }
}

const MAGAZINE_DETAIL_PUBLISHING_DATA = {
  content:
    '아무거나 올리자 생각은 나중에 할래 해시태그는 민망하니까 그냥 점 하나 찍고 도망가야지 문장은 그냥 쭉 여기까지 늘어날 수 있습니다.',
  hashtag: '#해시태그',
  likeCount: 123,
  publishedAt: '7시간 전',
  restaurants: [
    {
      category: '초밥',
      id: '1',
      imageUrls: [null, null, null],
      name: '히마와리 스시 신도심점인데 제목은 만약 한 줄 넘으면 말줄임표로 표시합니다.',
      openingHours: '평일 · 12:00~19:00',
      priceRange: 'JPY 1,000~2,000',
      rating: 4.5,
      region: '도쿄',
    },
    {
      category: '초밥',
      id: '2',
      imageUrls: [null, null, null],
      name: '히마와리 스시 신도심점',
      openingHours: '평일 · 12:00~19:00',
      priceRange: 'JPY 1,000~2,000',
      rating: 4.5,
      region: '도쿄',
    },
  ],
} satisfies Omit<MagazineDetailPreview, 'coverImageUrls' | 'title'>

export const createMagazineDetailPreview = (
  state: unknown,
): MagazineDetailPreview => {
  const preview = getPreviewFields(state)
  const title = preview?.title?.trim() || DEFAULT_TITLE
  const imageUrl = preview?.imageUrl?.trim()

  return {
    ...MAGAZINE_DETAIL_PUBLISHING_DATA,
    title,
    coverImageUrls: imageUrl ? [imageUrl] : [],
  }
}
