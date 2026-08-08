import type { SeoMagazine } from '@/shared/seo/types'

export const mergeSeoMagazines = (...groups: SeoMagazine[][]) => {
  const magazines = new Map<string, SeoMagazine>()

  groups.flat().forEach((magazine) => {
    magazines.set(magazine.id, magazines.get(magazine.id) ?? magazine)
  })

  return [...magazines.values()]
}
