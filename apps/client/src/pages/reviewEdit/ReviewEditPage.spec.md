# ReviewEditPage Spec

## Purpose

작성한 리뷰를 조회해 별점, 키워드, 사진, 본문을 수정 화면에서 확인하고 편집한다. 수정 API가 제공되기 전까지 저장 버튼은 입력 유효성에 따른 시각 상태만 제공하며 서버 상태를 변경하지 않는다.

## Route

- path: `/reviews/:reviewId/edit`
- path constant: `ROUTES.reviewEdit`
- route owner: `apps/client/src/app/router/routes.ts`
- access: `authOnly`, `AuthOnlyRoute`
- loading: `lazyPages.reviewEdit`
- layout: `RootLayout`
- bottom navigation: 없음
- unauthenticated redirect: `ROUTES.loginRequired`
- route param: `reviewId`는 양의 안전 정수 문자열만 허용한다.

## Requirements

- [x] 상단 고정 `ReviewHeader`에 제목 `리뷰 수정`과 뒤로가기 버튼을 표시한다.
- [x] 본문은 Figma node `8317:35917` 순서대로 예약 요약, 36px 별점, 키워드, 사진/본문, 저장 영역을 표시한다.
- [x] 예약 요약은 `ReviewReservationSummary density="comfortable"`를 사용해 92px 썸네일과 상하 20px 여백을 유지한다.
- [x] 기존 서버 사진 URL은 최대 10장까지만 130px 미리보기로 표시하고 페이지 local state에서만 삭제할 수 있다.
- [x] 키워드는 1~3개이며, 이미 3개가 선택된 상태에서는 추가 선택을 막는다.
- [x] 본문은 10~1000자 안내·오류 상태를 유지하고, textarea 최소 높이 230px을 사용한다.
- [x] 저장 버튼은 별점·키워드·본문·새 파일 제한이 유효할 때 활성화한다.
- [x] 저장 버튼 클릭은 수정 API, 이미지 업로드, cache invalidation, navigation을 실행하지 않는다.

## Data Dependencies

- query: `useMyReviewDetailQuery(reviewId)` / `GET /api/v1/reviews/me/{reviewId}`
- enabled: 유효한 양의 안전 정수 `reviewId`일 때만 요청한다.
- loading: `리뷰 수정 정보를 불러오는 중입니다.`
- error: `리뷰 수정 정보를 불러오지 못했습니다.`와 `다시 시도` 버튼을 표시한다.
- invalid route: API 호출 없이 `리뷰 수정 정보를 확인할 수 없습니다.`와 `마이 리뷰로 돌아가기`를 표시한다.
- mutation: 없음. Swagger에 리뷰 수정 endpoint가 없으므로 API boundary를 만들지 않는다.

## State

- route state: `reviewId`
- server state: 기존 리뷰 detail query
- page-local form state: rating, selected keyword IDs, review text, new `File[]`, existing photo URL `string[]`
- initialization: 같은 `reviewId`의 최초 성공 응답만 form state에 반영한다. 이후 refetch는 사용자가 편집 중인 draft를 덮어쓰지 않는다.
- derived state: `isSaveDisabled`, view model, invalid/pending/error state

## Component Mapping

- review feature: `ReviewHeader`, `ReviewReservationSummary`, `InputReviewRate`, `InputReviewKeyword`, `InputReviewMain`, `ReviewSubmitBar`, `useReviewForm`
- page-local: `useReviewEditPage`, `toReviewEditViewModel`
- HDS: page는 feature component를 조립하며 새 HDS API를 만들지 않는다.

## Navigation

- entry: 리뷰 상세의 `수정하기`, 마이 리뷰의 작성한 리뷰 더보기 메뉴 `수정하기`
- back: `navigate(-1)`
- invalid route return: `{ pathname: ROUTES.myReviews, search: '?tab=written' }`

## Non-goals

- `PATCH`/`PUT` 리뷰 수정 API, 이미지 업로드, 삭제한 기존 이미지의 서버 반영
- 저장 성공 toast, cache invalidation, 상세 페이지 이동

## Verification

- `corepack pnpm --filter @hashi/client exec vitest run src/pages/reviewEdit/ReviewEditPage.test.tsx`
- `corepack pnpm --filter @hashi/client typecheck`
- `corepack pnpm --filter @hashi/client lint`
- `corepack pnpm --filter @hashi/client build`
- `corepack pnpm --filter @hashi/client test`
