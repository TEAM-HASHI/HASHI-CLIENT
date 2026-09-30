# Page Spec: `Notices`

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
  - `GET /api/v1/notices?cursor={cursor}&size=10` (가계약, `features/notice/types.ts` 참고)
- query key:
  - `noticeQueryKeys.infiniteList(size)`
- query mode:
  - `useInfiniteQuery`, `initialPageParam: null`, `hasNext`/`nextCursor`로 다음 페이지 판단
- loading state:
  - `LoadingScreen`
- error state:
  - 첫 페이지: 공통 `AsyncBoundary` 오류 화면
  - 다음 페이지: 목록 하단 `다시 시도`
- empty state:
  - 범위 제외

### Mutation

- mutation: none

## Backend Contract (가계약)

공지사항 API는 기존 cursor 목록 형식과 기획 명세를 따르는 가계약이다. 2026-09-30 서버 `develop` (`053fdb3`) 및 열린 PR에서 endpoint를 찾지 못했고, dev-api OpenAPI 조회는 타임아웃이었다. 서버 계약과 실제 API 연결은 확인 대기다.
Swagger가 확정되면 `features/notice/types.ts`를 generated 타입으로 교체하고 `features/notice/api`만 맞춘다.

```ts
// GET /api/v1/notices?cursor=&size=10
interface NoticeListData {
  notices: {
    noticeId: number
    title: string
    publishedAt: string
    updatedAt: string | null
  }[]
  hasNext: boolean
  nextCursor: number | null
}
```

## Scroll Restoration

`RootLayout`이 pathname 변경 시 맨 위로 스크롤한다. 목록 행 선택 시 sessionStorage(`hashi:notice-list-state`)에 `{ scrollY, pageCount }`를 저장한다.
`POP`으로 돌아오면 저장한 페이지 수와 스크롤 높이를 충족할 때까지 다음 페이지를 순서대로 조회한 후 위치를 복원한다.
복원 중에는 무한 스크롤 observer를 중지하여 중복 조회를 막는다. 캐시가 만료돼도 같은 흐름으로 복원하며, 조회 실패 시 기존 목록과 목표 위치를 유지하고 다시 시도한다.
저장소를 사용할 수 없거나 값이 유효하지 않으면 복원을 건너뛴다. 목록 헤더 뒤로가기는 마이페이지로 replace 이동한다.

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

- 행: 좌우 20px, 상하 28px, 제목·날짜 간격 8px, `secondary-200` 하단 구분선
- 제목: `typo-sub-header-2 text-black truncate` (Figma 16px/600 `#101010`)
- 날짜: `typo-body-6 text-primary-200` (Figma 목록 날짜의 `Primary_200` 적용, 2026-09-30 확인)

- 다음 아이콘: 24px (`size-6`)

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 마지막 수정일 표시, 제목 말줄임, 상세 이동, 첫 페이지 오류·재시도, 다음 페이지 오류·재시도, 스크롤 복원, 뒤로가기 테스트
- [ ] 실제 API 연결 후 무한 스크롤과 스크롤 복원 수동 확인
