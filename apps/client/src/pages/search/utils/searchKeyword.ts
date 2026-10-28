export const MAX_SEARCH_KEYWORD_LENGTH = 30

export const getSearchKeywordError = (keyword: string) => {
  const value = keyword.trim()
  if (!value || value === '#') return '검색어를 입력해주세요.'
  if (value.startsWith('#') && /\s/.test(value)) {
    return '해시태그 검색에는 공백을 사용할 수 없어요.'
  }
  if (value.length > MAX_SEARCH_KEYWORD_LENGTH) {
    return '검색어는 최대 30자까지 입력할 수 있어요.'
  }
  return null
}
