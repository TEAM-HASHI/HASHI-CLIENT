# ReviewNewPage Spec

## Purpose

- 실제 방문이 확인된 사용자가 식당 리뷰를 작성하는 페이지를 제공한다.
- Figma `REVIEW-WRITE` 화면의 작성 흐름을 페이지 단위로 조립한다.

## Layout

- 앱 모바일 프레임 기준으로 부모 viewport 너비를 따르며, 내부 영역은 고정 `max-width: 393px`에 의존하지 않는다.
- 상단에는 `ReviewHeader`를 fixed top 영역으로 노출하고, 본문 form은 header 높이만큼 top padding을 둔다.
- 페이지와 form 내부 영역은 `min-w-0`, `overflow-x-hidden`을 사용해 작은 viewport에서도 가로 overflow가 생기지 않게 한다.
- 본문은 다음 순서로 배치한다.
  - `ReviewReservationSummary`
  - `InputReviewRate`
  - `InputReviewKeyword`
  - `InputReviewMain`
  - `ReviewSubmitBar`

## Data Dependencies

- 리뷰 작성 페이지는 URL search param `reservationId`를 기준으로 `GET /api/v1/reviews/context`를 호출한다.
- `reservationId`가 없거나 양의 10진 정수 문자열이 아니면 API를 호출하지 않고 잘못된 진입 상태를 표시한다.
- context 응답의 식당명, 썸네일, 방문 일시, 방문 인원으로 예약 요약을 표시한다.
- context 응답의 `reviewKeywordOptions`를 키워드 선택지로 사용하고 선택된 `code`를 form 상태에 보관한다.
- context 조회 중에는 로딩 상태를, 조회 실패 또는 빈 응답에는 오류 상태를 표시한다.
- `reviewable`이 `true`인 예약만 리뷰를 제출할 수 있다.
- 사진 파일은 `image/jpeg`, `image/png`, `image/webp`만 허용하고 제출 전까지 원본 `File[]` 상태로 보관한다.
- 사진이 선택되면 `POST /api/v1/uploads/presigned-urls`에 모든 파일의 `contentType`, `fileSize`를 벌크로 전달한다.
- 발급된 `uploads[]`의 순서를 선택 파일 순서와 대응시켜 각 `uploadUrl`에 원본 파일을 PUT한다.
- 첫 업로드에서 실패한 파일만 새 presigned URL을 벌크 재발급받아 1회 재시도한다.
- 재시도 후에도 한 파일이라도 실패하면 리뷰 작성 POST를 호출하지 않는다.
- 모든 이미지 업로드가 성공하면 `fileKey` 목록을 `imageFileKeys`로 `POST /api/v1/reviews`에 전달한다.
- 사진이 없으면 presigned API를 생략하고 빈 `imageFileKeys`로 리뷰를 작성한다.

## Interaction

- 리뷰 작성 페이지 진입 경로는 식당 상세 페이지의 리뷰쓰기 CTA, 마이의 마이 리뷰, 내 예약 총 3가지이다.
- 뒤로가기를 누르면 특정 고정 URL이나 홈으로 이동하지 않고 브라우저 히스토리의 이전 주소로 복귀한다.
- 별점은 1점부터 5점까지 정수로 선택한다.
- 키워드는 최소 1개, 최대 3개까지 선택한다.
- 리뷰 본문은 최소 10자, 최대 1000자까지 유효하다.
- 사진은 선택 입력이며 `image/jpeg`, `image/png`, `image/webp`, 최대 10장, 장당 5MB 이하일 때 유효하다.
- 지원하지 않는 MIME 타입의 사진은 프론트에서 먼저 거절하고, 파일 상태에 추가하지 않으며 에러 메시지를 표시한다.
- 장당 5MB를 초과한 사진은 프론트에서 먼저 거절하고, 파일 상태에 추가하지 않으며 에러 메시지를 표시한다.
- 남은 슬롯보다 많은 사진을 선택하면 최대 10장까지만 파일 상태에 추가하고, 초과 에러 메시지를 표시한다.
- 선택된 사진이 10장이 되면 사진 추가 버튼을 비활성화한다.
- 사진을 선택하면 이미지 미리보기를 가로 스크롤 목록으로 표시한다.
- 선택된 사진 미리보기의 삭제 버튼을 누르면 해당 사진을 파일 상태에서 제거한다.
- 저장하기 버튼은 필수 입력값과 사진 제한이 모두 유효하고, 예약이 리뷰 작성 가능하며, 제출 중이 아닐 때만 활성화한다.
- 리뷰 제출 중에는 저장 버튼을 로딩/비활성화 상태로 유지해 중복 요청을 막는다.
- 리뷰 작성 성공 시 응답의 `reviewId`로 `/reviews/:reviewId` 상세 페이지에 이동한다.
- 이미지 업로드 또는 리뷰 작성 실패 시 상세 페이지로 이동하지 않고 재시도 가능한 오류 메시지를 표시한다.

## API Integration Map

| Action               | Endpoint                                         | Input                                                                 | Success                   | Failure                       |
| -------------------- | ------------------------------------------------ | --------------------------------------------------------------------- | ------------------------- | ----------------------------- |
| 작성 context 조회    | `GET /api/v1/reviews/context?reservationId={id}` | 양의 정수 예약 ID                                                     | 예약/식당/키워드 렌더링   | 작성 화면 오류 상태           |
| 업로드 URL 벌크 발급 | `POST /api/v1/uploads/presigned-urls`            | `usage: review`, `files[]`                                            | `uploads[]` 수신          | 리뷰 POST 중단                |
| S3 파일 업로드       | 각 `uploadUrl`                                   | 원본 `File`, `Content-Type`                                           | `fileKey` 수집            | 실패 파일만 1회 재발급/재시도 |
| 리뷰 작성            | `POST /api/v1/reviews`                           | `reservationId`, `rating`, `keywordCodes`, `content`, `imageFileKeys` | `/reviews/:reviewId` 이동 | 현재 화면 유지 및 오류 표시   |

## State And Structure

- `ReviewNewPage`는 route page로서 레이아웃 조립, 뒤로가기 navigation, feature component/hook 연결만 담당한다.
- 리뷰 작성/수정에서 재사용 가능한 form 상태와 submit 가능 여부는 `features/review/hooks/useReviewForm.ts`에서 관리한다.
- 리뷰 본문 길이, 사진 개수, 사진 용량 같은 순수 검증 기준은 리뷰 작성/수정 플로우에서 함께 쓰는 규칙이므로 `features/review/utils/reviewValidation.ts`에 둔다.
- 리뷰 입력 제한값과 에러 문구는 리뷰 작성/수정 플로우에서 함께 쓰는 규칙이므로 `features/review/constants`에 둔다.
- 리뷰 입력 UI 컴포넌트는 리뷰 작성/수정에서 재사용 가능하므로 `features/review/components`에서 가져온다.
- 별점, 키워드, 리뷰 본문처럼 자체 상호작용을 가진 feature component는 component test를 유지하고, 헤더/예약 요약/저장 바처럼 page flow에 종속된 단순 component는 page test에서 검증한다.

## Non-goals

- 리뷰 수정 API와 리뷰 작성 완료 포인트 안내 UI는 이번 범위에 포함하지 않는다.

## Verification

- `pnpm exec vitest run src/pages/reviewNew src/features/review/components/inputReviewKeyword/InputReviewKeyword.test.tsx`
- `pnpm typecheck`
- `pnpm lint`
