export const getPageScrollElement = () =>
  document.querySelector<HTMLElement>('[data-page-scroll]')

export const getPageScrollTarget = (): HTMLElement | Window =>
  getPageScrollElement() ?? window

export const getPageScrollY = () =>
  getPageScrollElement()?.scrollTop ?? window.scrollY

export const scrollPageTo = (options: ScrollToOptions) =>
  getPageScrollTarget().scrollTo(options)

export const getPageMaxScrollY = () => {
  const element = getPageScrollElement()
  return Math.max(
    0,
    element
      ? element.scrollHeight - element.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight,
  )
}
