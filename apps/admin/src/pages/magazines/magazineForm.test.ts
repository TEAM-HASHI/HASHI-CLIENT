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

describe('magazineForm', () => {
  it('serializes exactly the three create fields', () => {
    expect(
      toCreateMagazineBody({
        title: '도쿄의 밤',
        banner: uploadedBanner,
        existingBannerUrl: null,
        instagramRedirectUrl: 'https://instagram.com/p/hashi',
      }),
    ).toEqual({
      title: '도쿄의 밤',
      bannerKey: 'magazines/tokyo.webp',
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

  it('requires a valid http URL and uploaded banner for create', () => {
    const form = createMagazineForm()
    form.title = '도쿄의 밤'
    form.instagramRedirectUrl = 'javascript:alert(1)'

    expect(validateMagazineForm(form, 'create', new Set())).toMatchObject({
      banner: expect.any(String),
      instagramRedirectUrl: expect.any(String),
    })
  })
})
