# ReviewDetailPage Spec

## Purpose

- 사용자가 본인이 작성한 방문 리뷰의 상세 내용을 확인할 수 있는 페이지를 제공한다.
- Figma `리뷰 상세` 화면의 식당 정보, 별점, 작성일, 리뷰 본문, 리뷰 이미지, 키워드, 삭제 확인 흐름을 구현한다.

## Route

- path: `/reviews/:reviewId`
- path constant: `ROUTES.reviewDetail`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout`
- access type: `authOnly`
- guard: `AuthOnlyRoute`
- lazy loading: `lazyPages.reviewDetail`
- bottom navigation: 없음

## Requirements

- 상단에는 review feature의 `ReviewHeader`를 재사용해 `리뷰 상세` 타이틀과 뒤로가기 버튼을 보여준다.
- 상단 고정 배치를 위해 페이지에서 `ReviewHeader`를 fixed wrapper 안에 렌더링한다.
- 뒤로가기 버튼을 누르면 `ROUTES.myReviews`로 이동한다.
- 식당 정보 영역은 review feature의 `ReviewReservationSummary`를 재사용한다.
  - 식당 썸네일, 식당명, 방문 일시, 방문 인원 정보를 표시한다.
  - 이미지가 없으면 공통 `DefaultImage` fallback을 사용한다.
- 리뷰 내용 영역은 별점, 작성일, 리뷰 본문을 표시한다.
- 리뷰 본문은 HDS `CollapsibleText`를 사용한다.
  - 본문이 실제 3줄을 초과하면 접힌 상태에서 최대 3줄까지 보여주고 `더보기` 버튼으로 전체 내용을 펼친다.
  - 3줄을 초과하지 않으면 `더보기` 버튼을 노출하지 않는다.
- 리뷰 이미지가 있으면 가로 스크롤 리스트로 표시한다.
  - 리뷰 이미지는 review feature의 사진 정책과 동일하게 최대 10장까지만 표시한다.
  - 사진당 5MB 제한은 리뷰 작성/업로드 시점의 `REVIEW_PHOTO_MAX_SIZE_BYTES` 검증으로 보장한다.
  - MVP 범위에서 영상은 제외한다.
  - 이미지가 없으면 이미지 영역을 렌더링하지 않는다.
- 리뷰 작성 시 선택한 키워드를 최소 1개, 최대 3개까지 표시한다.
  - 키워드 label/icon은 `features/review/constants`의 `REVIEW_KEYWORDS`를 기준으로 표시한다.
- 하단에는 fixed action bar를 보여준다.
  - `삭제하기`: 삭제 확인 모달을 연다.
  - `수정하기`: MVP 제외 기능이며, 공통 `ComingSoonDialog`를 연다.
- 삭제 확인 모달은 HDS `Dialog`를 사용한다.
  - `취소하기`를 누르면 모달만 닫힌다.
  - `삭제하기`를 누르면 모달을 닫고 `ROUTES.myReviews`로 이동한다.
- 수정 준비중 안내 모달은 app shared `ComingSoonDialog`를 사용한다.
  - `확인`을 누르면 모달만 닫힌다.
  - route 이동이나 API 호출은 발생하지 않는다.

## Data

- 현재 퍼블리싱 범위에서는 page-local mock 데이터로 리뷰 상세를 표시한다.
- `reviewId` route param으로 mock 리뷰를 찾고, 없는 경우 퍼블리싱 확인을 위해 기본 mock 리뷰를 표시한다.
- API 연동 전에는 리뷰 상세 query의 not found 응답을 404 또는 에러 상태로 처리할지 확정한다.
- API 연동 시 리뷰 상세 query, 리뷰 삭제 mutation, 삭제 성공/실패 toast를 hook 내부에서 교체한다.

## State And Structure

- `ReviewDetailPage`는 route page로서 layout composition과 hook 연결만 담당한다.
- `useReviewDetailPage`는 route param, mock 조회, delete/edit modal open state, navigation handler를 관리한다.
- 리뷰 상세에서만 쓰이는 본문/이미지/액션바/모달 UI는 page-local component로 둔다.
- 리뷰 작성/상세/수정 흐름에서도 사용하는 `ReviewHeader`, 예약 요약 UI, 키워드 상수, 사진 제한 상수는 `features/review`에서 재사용한다.
- page-local component에는 review feature에서 재사용 가능한 header wrapper를 중복 구현하지 않는다.
- HDS package에는 route, API, 제품 copy, 도메인 데이터를 넣지 않는다.

## Accessibility

- 페이지 root는 `aria-label="리뷰 상세"`을 가진다.
- 뒤로가기 버튼은 accessible name을 가진다.
- 리뷰 별점은 read-only `StarRating`의 `role="img"`와 label로 전달한다.
- 리뷰 이미지 리스트는 접근 가능한 list label을 가진다.
- 삭제 확인 모달은 `alertdialog`로 렌더링한다.
- 모달의 `취소하기`/`삭제하기` 버튼은 각각 명확한 accessible name을 가진다.
- 수정 준비중 안내 모달은 공통 `ComingSoonDialog`의 접근성 계약을 따른다.

## Verification

- `corepack pnpm --filter @hashi/client test -- ReviewDetailPage`
- `corepack pnpm --filter @hashi/client lint`
- `corepack pnpm --filter @hashi/client typecheck`
- `corepack pnpm --filter @hashi/client build`
- 수동 확인:
  - `/reviews/review-1` 직접 진입
  - 뒤로가기 버튼 클릭 시 `/my-reviews` 이동
  - 긴 리뷰 본문 `더보기` 클릭 시 펼침
  - `삭제하기` 클릭 시 확인 모달 노출
  - 삭제 모달의 `취소하기` 클릭 시 닫힘
  - 삭제 모달의 `삭제하기` 클릭 시 `/my-reviews` 이동
  - `수정하기` 클릭 시 준비중 안내 모달 노출
  - 준비중 안내 모달의 `확인` 클릭 시 닫힘
