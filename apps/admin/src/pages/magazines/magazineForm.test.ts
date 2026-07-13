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
  it('serializes the banner and thumbnail keys for create', () => {
    expect(
      toCreateMagazineBody({
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
})
