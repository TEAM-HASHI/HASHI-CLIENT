# ReviewNewPage Spec

## Purpose

- 실제 방문이 확인된 사용자가 식당 리뷰를 작성하는 페이지를 제공한다.
- Figma `REVIEW-WRITE` 화면의 작성 흐름을 페이지 단위로 조립한다.

## Layout

- 모바일 기준 폭 393px 화면을 중앙 정렬한다.
- 상단에는 `ReviewHeader`를 고정 흐름의 첫 영역으로 노출한다.
- 본문은 다음 순서로 배치한다.
  - `ReviewReservationSummary`
  - `InputReviewRate`
  - `InputReviewKeyword`
  - `InputReviewMain`
  - `ReviewSubmitBar`

## Data

- 현재 퍼블리싱 범위에서는 예약 요약 정보를 정적 데이터로 표시한다.
- 예약 요약 정적 데이터는 API 연동 전까지 page-local `constants/reviewNewMockData.ts`에서 관리한다.
- API 연동 시 식당명, 방문 날짜/시간, 방문 인원, 썸네일은 예약 상세 응답에서 주입한다.
- 사진 파일은 S3 업로드 API 계약이 확정되기 전까지 원본 `File[]` 상태로 보관한다.
- S3 presigned URL 요청, S3 업로드, 업로드된 이미지 URL을 포함한 리뷰 등록 mutation은 API 계약 확정 후 별도 데이터 레이어에서 연결한다.

## Interaction

- 리뷰 작성 페이지 진입 경로는 식당 상세 페이지의 리뷰쓰기 CTA, 마이의 마이 리뷰, 내 예약 총 3가지이다.
- 뒤로가기를 누르면 특정 고정 URL이나 홈으로 이동하지 않고 브라우저 히스토리의 이전 주소로 복귀한다.
- 별점은 1점부터 5점까지 정수로 선택한다.
- 키워드는 최소 1개, 최대 3개까지 선택한다.
- 리뷰 본문은 최소 10자, 최대 1000자까지 유효하다.
- 사진은 선택 입력이며 최대 10장, 장당 5MB 이하일 때 유효하다.
- 장당 5MB를 초과한 사진은 프론트에서 먼저 거절하고, 파일 상태에 추가하지 않으며 에러 메시지를 표시한다.
- 남은 슬롯보다 많은 사진을 선택하면 최대 10장까지만 파일 상태에 추가하고, 초과 에러 메시지를 표시한다.
- 선택된 사진이 10장이 되면 사진 추가 버튼을 비활성화한다.
- 사진을 선택하면 이미지 미리보기를 가로 스크롤 목록으로 표시한다.
- 선택된 사진 미리보기의 삭제 버튼을 누르면 해당 사진을 파일 상태에서 제거한다.
- 저장하기 버튼은 필수 입력값이 모두 유효하고 사진 제한을 넘지 않을 때만 활성화한다.

## State And Structure

- `ReviewNewPage`는 route page로서 레이아웃 조립, 뒤로가기 navigation, feature component 연결만 담당한다.
- 리뷰 작성 form 상태와 submit 가능 여부는 page-local `hooks/useReviewNewForm.ts`에서 관리한다.
- 리뷰 본문 길이, 사진 개수, 사진 용량 같은 순수 검증 기준은 리뷰 작성/수정 플로우에서 함께 쓰는 규칙이므로 `features/review/utils/reviewValidation.ts`에 둔다.
- 리뷰 입력 제한값과 에러 문구는 리뷰 작성/수정 플로우에서 함께 쓰는 규칙이므로 `features/review/constants`에 둔다.
- 리뷰 입력 UI 컴포넌트는 리뷰 작성/수정에서 재사용 가능하므로 `features/review/components`에서 가져온다.
- 별점, 키워드, 리뷰 본문처럼 자체 상호작용을 가진 feature component는 component test를 유지하고, 헤더/예약 요약/저장 바처럼 page flow에 종속된 단순 component는 page test에서 검증한다.

## Non-goals

- 리뷰 등록 API 호출과 성공/실패 토스트는 이번 퍼블리싱 범위에 포함하지 않는다.
