import { describe, expect, it } from 'vitest'
import {
  createMagazineForm,
  toCreateMagazineBody,
  toUpdateMagazineBody,
  validateMagazineForm,
} from '@/pages/magazines/magazineForm'

const uploadedBanner = {
  fileKey: 'magazines/tokyo.webp',
  fileUrl: 'https://cdn.example/tokyo.webp',
  fileName: 'tokyo.webp',
  contentType: 'image/webp',
}

const uploadedThumbnail = {
  fileKey: 'magazines/tokyo-thumbnail.webp',
  fileUrl: 'https://cdn.example/tokyo-thumbnail.webp',
  fileName: 'tokyo-thumbnail.webp',
  contentType: 'image/webp',
}

describe('magazineForm', () => {
  it('rejects more than 20 card-news images for create and replacement but preserves untouched images', () => {
    const form = createMagazineForm()
    form.cardNews = Array.from({ length: 21 }, (_, index) => ({
      ...uploadedBanner,
      fileKey: `card-${index}`,
    }))
    expect(
      validateMagazineForm(form, 'create', new Set()).cardNews,
    ).toBeTruthy()
    expect(
      validateMagazineForm(form, 'update', new Set()).cardNews,
    ).toBeUndefined()
    form.replaceCardNews = true
    expect(
      validateMagazineForm(form, 'update', new Set()).cardNews,
    ).toBeTruthy()
    form.cardNews.pop()
    expect(
      validateMagazineForm(form, 'update', new Set()).cardNews,
    ).toBeUndefined()
  })
  it('serializes the banner and thumbnail keys for create', () => {
    expect(
      toCreateMagazineBody({
        ...createMagazineForm(),
        title: '도쿄의 밤',
        banner: uploadedBanner,
        thumbnail: uploadedThumbnail,
        existingBannerUrl: null,
        existingThumbnailUrl: null,
        instagramRedirectUrl: 'https://instagram.com/p/hashi',
      }),
    ).toEqual({
      title: '도쿄의 밤',
      bannerKey: 'magazines/tokyo.webp',
      thumbnailKey: 'magazines/tokyo-thumbnail.webp',
      instagramRedirectUrl: 'https://instagram.com/p/hashi',
      content: '',
      hashtags: [],
      restaurantIds: [],
      cardNews: [],
    })
  })

  it('omits untouched fields and banner from update', () => {
    const form = createMagazineForm()
    form.title = '새 제목'

    expect(toUpdateMagazineBody(form, new Set(['title']))).toEqual({
      title: '새 제목',
    })
  })

  it('requires a valid http URL, uploaded banner, and uploaded thumbnail for create', () => {
    const form = createMagazineForm()
    form.title = '도쿄의 밤'
    form.instagramRedirectUrl = 'javascript:alert(1)'

    expect(validateMagazineForm(form, 'create', new Set())).toMatchObject({
      banner: expect.any(String),
      thumbnail: expect.any(String),
      instagramRedirectUrl: expect.any(String),
    })
  })

  it('serializes a newly uploaded thumbnail for update', () => {
    const form = createMagazineForm()
    form.thumbnail = uploadedThumbnail

    expect(toUpdateMagazineBody(form, new Set())).toEqual({
      thumbnailKey: 'magazines/tokyo-thumbnail.webp',
    })
  })

  it('rejects duplicate images and invalid or excess restaurant selections', () => {
    const form = createMagazineForm()
    form.replaceCardNews = true
    form.cardNews = [uploadedBanner, uploadedBanner]
    form.restaurants = [1001, 1001, 0, Number.MAX_SAFE_INTEGER + 1].map(
      (restaurantId) => ({ restaurantId, name: '식당' }),
    )
    form.hashtags = '도쿄, 도쿄'
    expect(
      validateMagazineForm(
        form,
        'update',
        new Set(['restaurantIds', 'hashtags']),
      ),
    ).toMatchObject({
      cardNews: expect.any(String),
      restaurantIds: expect.any(String),
      hashtags: expect.any(String),
    })
    form.restaurants = Array.from({ length: 11 }, (_, index) => ({
      restaurantId: index + 1,
      name: '식당',
    }))
    expect(
      validateMagazineForm(form, 'update', new Set(['restaurantIds']))
        .restaurantIds,
    ).toBeTruthy()
  })
})
