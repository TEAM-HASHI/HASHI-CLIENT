# Page Spec: `Notices`

## 2026-10-08 검증 결과

- `pnpm test`: client 694개(142 파일), HDS 226개(25 파일) 통과.
- `pnpm --filter @hashi/client lint`, `typecheck`, `build`: 통과.
- `git diff --check`: 통과.
- 실제 개발 API 목록은 HTTP 200 및 notices 0건이었다. 항상 게시 공지가 존재한다는 운영 전제를 충족하지 않아, 게시 후 실제 상세·무한 스크롤 확인이 필요하다.
- 모바일 실기기 터치 및 실제 게시 데이터 기반 브라우저 QA는 미실행.

Jira: HASHI-208

## Purpose

- 사용자가 게시된 공지사항을 최신 게시일순으로 확인하고 상세로 이동할 수 있게 한다.
- 기획 명세: HASHI-PLAN `02_PRODUCT_SPEC/MYPAGE/MYPAGE_NOTICE/MYPAGE_NOTICE.md` §3, §4.1, §4.4
- 디자인: Figma `Hashi.kr` > 서비스 전체 화면 > 공지사항 섹션 (node-id 8317-34181), 목록 프레임 8317-34186

## Route

- path: `/notices`
- path constant:
  - `ROUTES.notices`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout` > `BottomNavigationLayout`
- access type:
  - `public`
- guard:
  - none
- lazy loading:
  - `lazyPages.notices`
- bottom navigation:
  - yes (`마이` 탭 활성)
- redirect: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/notices/NoticesPage.tsx`
- spec path:
  - `apps/client/src/pages/notices/NoticesPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`
  - URL helper: `getNoticeDetailPath` in `apps/client/src/app/router/routePaths.ts`

## Requirements

- [x] 상단 Header에 뒤로가기 버튼과 `공지사항` 제목을 고정해 보여준다.
- [x] 게시된 공지사항의 제목과 마지막 수정일(`YYYY.MM.DD`, 수정 이력이 없으면 게시일)을 서버 응답 순서(최신 게시일순)대로 보여준다.
- [x] 제목은 한 줄까지만 표시하고 넘치면 말줄임표로 처리한다.
- [x] 10개씩 불러오고, 목록 끝에 도달하면 다음 페이지를 불러온다(무한 스크롤).
- [x] 행을 선택하면 `/notices/{noticeId}` 상세로 이동한다.
- [x] 상세에서 뒤로 돌아오면 이미 불러온 목록과 스크롤 위치를 복원한다.
- [x] 첫 페이지 조회 실패 시 공통 전면 오류 화면(`AsyncBoundary`)을 보여주고, 다시 시도하면 첫 페이지부터 다시 조회한다.
- [x] 다음 페이지 조회 실패 시 기존 목록을 유지하고 하단에 `다시 시도` 버튼을 보여준다. 자동 재시도는 공통 query retry 정책(5xx·네트워크·타임아웃 1회)을 따른다.
- [x] 빈 목록 화면은 기획 범위에서 제외한다(게시된 공지가 항상 존재한다는 운영 전제).
- [x] 비로그인 사용자도 접근할 수 있다.
- [x] 마이페이지 `공지사항` 메뉴에서 진입한다.

## Data Dependencies

### Query

- query:
  - `GET /api/v1/notices?cursor={cursor}` (문자열 커서, 서버 고정 10개)
- query key:
  - `noticeQueryKeys.infiniteList()`
- query mode:
  - `useInfiniteQuery`, `initialPageParam: null`, `hasNext`/`nextCursor`로 다음 페이지 판단
- loading state:
  - `LoadingScreen`
- error state:
  - 첫 페이지: 공통 `AsyncBoundary` 오류 화면
  - 다음 페이지: 목록 하단 `다시 시도`. 이 query는 `throwOnError: false`로 전역 5xx 전파를 막고 첫 페이지 오류만 명시적으로 throw한다.
- empty state:
  - 공개된 공지가 없으면 `등록된 공지사항이 없어요.` 표시

### Mutation

- mutation: none

## Backend Contract

2026-10-08 실제 OpenAPI와 서버 `origin/develop e780c4c7`에서 API 계약을 확인했다. HASHI-PLAN `1c981e5` 기준이다.
`features/notice/types.ts`는 generated 타입을 기반으로 서버 DTO의 필수 필드 및 nullable 커서를 보완한다. 커서는 해석하지 않고 그대로 전달한다. null data는 빈 목록으로 숨기지 않고 계약 오류로 처리한다.

```ts
// GET /api/v1/notices?cursor={opaque-string}
interface NoticeListData {
  notices: {
    noticeId: number
    title: string
    lastModifiedAt: string
  }[]
  hasNext: boolean
  nextCursor: string | null
}
```

## Scroll Restoration

`RootLayout`이 pathname 변경 시 맨 위로 스크롤한다. 목록 행 선택 시 sessionStorage(`hashi:notice-list-state`)에 `{ scrollY, pageCount }`를 저장한다.
`POP`으로 돌아오면 저장한 페이지 수와 스크롤 높이를 충족할 때까지 다음 페이지를 순서대로 조회한 후 위치를 복원한다.
복원 중에는 무한 스크롤 observer를 중지하여 중복 조회를 막는다. 캐시가 만료돼도 같은 흐름으로 복원하며, 조회 실패 시 기존 목록과 목표 위치를 유지하고 다시 시도한다.
저장소를 사용할 수 없거나 값이 유효하지 않으면 복원을 건너뛴다. 목록 헤더 뒤로가기는 앱 history index가 1 이상이면 이전 화면으로 이동하고, 직접 진입이면 마이페이지로 replace 이동한다.

## UI Structure

```text
NoticesPage
  Header (back, 공지사항)
  ul
    li > button (title, lastUpdatedDate, NextIcon)
    li (infinite scroll trigger | next page retry)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
- app shared component:
  - `LoadingScreen`
- shared hook:
  - `useInfiniteScrollTrigger`
- feature:
  - `getNotices`, `noticeQueryKeys`, `formatNoticeLastUpdatedDate`
- icon:
  - `BackIcon`
  - `NextIcon`

## Styling

- 행: 좌우 20px, 상하 28px, 제목·날짜 간격 8px, `warm-gray-100` 하단 구분선
- 제목: `typo-sub-header-2 text-black truncate` (Figma 16px/600 `#101010`)
- 날짜: `typo-body-7 text-primary-200` (14px Regular/400). 최신 Figma `UI [디자인 2차 스프린트]`의 `9343-111942` 내부 목록 항목 기준, 2026-10-19 확인.
- 화살표: `NextIcon` 24px, `text-cool-gray-900`, 제목 영역 상단 정렬
- 페이지 최소 높이: `app-mobile-bottom-nav-content`로 하단 내비게이션 높이를 제외한다.

- 다음 아이콘: 24px (`size-6`), 제목·날짜 묶음과 상단 정렬 (`items-start`)

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 마지막 수정일 표시, 제목 말줄임, 상세 이동, 첫 페이지 오류·재시도, 다음 페이지 오류·재시도, 스크롤 복원, 뒤로가기 테스트
- [ ] 실제 API 연결 후 무한 스크롤과 스크롤 복원 수동 확인

- 상세 이동 시 `fromNoticeList` 상태와 목록 페이지 수·스크롤 저장을 회귀 테스트로 검증한다.

- 2026-10-17 Figma 공지사항 섹션 `8317:34181` 원본을 직접 열어 목록·상세 구성과 기존 스타일 명세를 재확인했다. 이번 수정은 탐색 동작 회귀 테스트 복구이며 화면 구현 변경은 없다.

## API Integration Verification (2026-10-17)

- 개발 서버 GET /notices HTTP 200, notices=[]·nextCursor=null·hasNext=false 확인.
- 최신 user OpenAPI와 공지·본문·이미지 DTO 타입 일치 확인. 서버 opaque cursor를 해석하지 않고 전달한다.
- 실제 게시 공지가 없어 실데이터 상세·이미지 및 모바일 제스처 검증은 대기한다.

- 2026-10-17 전체 142 files / 694 tests, lint·typecheck·build 통과. 빈 목록 안내 추가 테스트를 포함한 목록 12 tests 별도 통과.
- localhost Origin(127.0.0.1:5192) 요청은 서버 HTTP 403 확인. 브라우저 실데이터 확인은 CORS 허용 환경에서 추가 필요.

## Design Alignment Verification (2026-10-19)

- 공지 목록·상세 테스트 22개 및 client lint·typecheck·build 통과.
- 393px 브라우저에서 수정된 스타일 확인. 로컬 API 테스트 응답을 사용했으며 실제 게시 데이터 검증과 배포는 별도다.
