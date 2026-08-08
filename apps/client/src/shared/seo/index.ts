export {
  createHomeSeoPage,
  createMagazineListSeoPage,
  createMenuDetailSeoPage,
  createNotFoundSeoPage,
  createRestaurantDetailSeoPage,
  createRestaurantListSeoPage,
  SEO_DEFAULT_IMAGE,
  SEO_SITE_ORIGIN,
} from './pageBuilders'
export { mergeSeoMagazines } from './mergeSeoMagazines'
export { PageSeo } from './PageSeo'
export { parseSeoPrice } from './parseSeoPrice'
export { getRouteSeoFallback } from './routePolicy'
export { SeoProvider } from './SeoProvider'
export type {
  SeoLink,
  SeoFact,
  SeoMagazine,
  SeoMenu,
  SeoPage,
  SeoRestaurant,
  SeoRobots,
  SeoSnapshot,
} from './types'
