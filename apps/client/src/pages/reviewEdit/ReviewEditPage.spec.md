# ReviewEditPage Spec

## Purpose

작성한 리뷰의 수정 초기값을 조회하고 별점, 키워드, 사진, 본문을 편집해 서버에 저장한다.

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
- [x] 기존 사진을 `fileKey`·`imageUrl` 쌍으로 보관해 130px 미리보기로 표시한다. 삭제한 사진의 key는 저장 요청에서 제외한다.
- [x] 키워드는 1~3개이며, 이미 3개가 선택된 상태에서는 추가 선택을 막는다.
- [x] 수정 초기값의 `selectedKeywordCodes`로 선택을 복원하고, `reviewKeywordOptions`가 제공되면 해당 코드·라벨로 키워드를 표시한다. 옵션이 없으면 클라이언트 키워드 목록을 사용한다.
- [x] 본문은 최대 1000자까지만 입력받으며 직접 입력·붙여넣기 모두 초과분을 차단한다. 1000자는 유효하며 다른 필수 조건을 만족하면 저장 버튼을 활성화한다. 최소 10자 안내·오류 상태와 textarea 최소 높이 230px을 유지한다.
- [x] 저장 버튼은 별점·키워드·본문·새 파일 제한이 유효하고 기존 사진과 새 사진을 합쳐 10장 이하일 때 활성화한다. 저장 중에는 중복 제출을 막는다.
- [x] 새 사진만 presigned URL로 업로드하고, 남긴 기존 사진의 `fileKey` 뒤에 업로드된 key를 붙여 최종 `imageFileKeys`를 만든다. 사진을 모두 지우면 빈 배열을 보낸다.
- [x] 저장 성공 시 리뷰 상세로 이동한다. 실패 시 draft를 유지하고 오류 메시지와 재시도 가능한 저장 버튼을 표시한다.

## Data Dependencies

- query: `useReviewEditContextQuery(reviewId)` / `GET /api/v1/reviews/me/{reviewId}/edit-context`
- enabled: 유효한 양의 안전 정수 `reviewId`일 때만 요청한다.
- loading: `리뷰 수정 정보를 불러오는 중입니다.`
- not found: 유효한 ID의 요청이 404이면 `리뷰 수정 정보를 찾을 수 없습니다.`와 `마이 리뷰로 돌아가기` 버튼을 표시한다.
- error: 404 이외의 조회 실패에는 `리뷰 수정 정보를 불러오지 못했습니다.`와 `다시 시도` 버튼을 표시한다.
- invalid route: API 호출 없이 `리뷰 수정 정보를 확인할 수 없습니다.`와 `마이 리뷰로 돌아가기`를 표시한다.
- mutation: `useUpdateReviewMutation` / `PATCH /api/v1/reviews/{reviewId}`. 응답 `data: null`을 정상 성공으로 처리한다.
- upload: `POST /api/v1/uploads/presigned-urls` (`usage: review`) → 각 presigned URL로 파일 업로드. 작성·수정 화면이 같은 업로드 함수를 사용한다.
- cache: 성공 후 해당 리뷰 상세와 수정 context의 비활성 cache까지 재조회한 뒤 상세 화면으로 이동한다. 작성한 리뷰 목록과 해당 식당 상세·사진 query도 무효화한다. 리뷰 수와 포인트는 수정으로 변하지 않는다.

## API Integration Map

| UI field  | `ReviewEditContextResponse`                                      | `UpdateReviewRequest`                                                |
| --------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| 별점      | `rating`                                                         | `rating` (1~5)                                                       |
| 키워드    | `selectedKeywordCodes`, `reviewKeywordOptions`                   | `keywordCodes` (1~3, 중복 없음)                                      |
| 본문      | `content`                                                        | `content` (10~1000자)                                                |
| 기존 사진 | `images[].fileKey`, `images[].imageUrl`, `images[].displayOrder` | 남긴 `fileKey`를 `imageFileKeys`에 포함                              |
| 새 사진   | 없음                                                             | 업로드 후 반환된 `fileKey`를 `imageFileKeys`에 추가 (전체 최대 10장) |
| 식당      | `restaurantId`, `restaurantName`, `restaurantThumbnailUrl`       | 전송하지 않음. `restaurantId`는 cache 무효화에 사용                  |

- Swagger source: `https://dev-api.hashi.kr/v3/api-docs/user` (`/swagger-ui/index.html?urls.primaryName=user`에서 연결되는 user OpenAPI 문서).
- `reviewId`는 양의 안전 정수여야 하며 두 endpoint 모두 bearer 인증이 필요하다.
- 조회·수정의 404는 소유하지 않은 리뷰도 포함한다. 조회 404는 마이 리뷰로 돌아가는 상태를 표시하고, 저장 실패는 draft를 유지한다.
- 수정 요청은 변경된 필드만 보내는 PATCH가 아니라 수정 가능한 필드의 **최종 상태 전체**를 보낸다. 빈 `imageFileKeys`는 전체 사진 삭제를 뜻한다.
- `images`에 key 또는 URL이 없거나 10장을 넘으면 불완전한 초기값으로 처리해 저장을 막는다.

## State

- route state: `reviewId`
- server state: 리뷰 수정 context query, 저장 mutation
- page-local form state: rating, selected keyword codes, review text, new `File[]`, existing image `{ fileKey, imageUrl }[]`
- initialization: cache가 재조회 중이면 최신 응답을 기다린 뒤 form state를 채운다. 같은 `reviewId`의 최초 성공 응답만 반영하며, 이후 refetch는 사용자가 편집 중인 draft를 덮어쓰지 않는다. `reviewId`가 바뀌면 새 서버 응답으로 별점·키워드·본문·기존 사진을 다시 채우고, 이전 리뷰에서 새로 첨부한 `File[]`은 비운다.
- derived state: `isSaveDisabled`, view model, invalid/pending/error state

## Component Mapping

- review feature: `ReviewHeader`, `ReviewReservationSummary`, `InputReviewRate`, `InputReviewKeyword`, `InputReviewMain`, `ReviewSubmitBar`, `useReviewForm`
- page-local: `useReviewEditPage`, `toReviewEditViewModel`, 수정 context query·저장 mutation
- HDS: page는 feature component를 조립하며 새 HDS API를 만들지 않는다.

## Navigation

- entry: 리뷰 상세의 `수정하기`, 마이 리뷰의 작성한 리뷰 더보기 메뉴 `수정하기`
- back: `navigate(-1)`
- invalid route return: `{ pathname: ROUTES.myReviews, search: '?tab=written' }`
- not found return: `{ pathname: ROUTES.myReviews, search: '?tab=written' }`
- save success: `ROUTES.reviewDetail`에 현재 `reviewId`를 넣어 이동

## Non-goals

- 수정 화면에서 리뷰 삭제 또는 예약 정보 변경

## Verification

- `corepack pnpm --filter @hashi/client exec vitest run src/pages/reviewEdit/ReviewEditPage.test.tsx`
- `corepack pnpm --filter @hashi/client typecheck`
- `corepack pnpm --filter @hashi/client lint`
- `corepack pnpm --filter @hashi/client build`
- `corepack pnpm --filter @hashi/client test`
