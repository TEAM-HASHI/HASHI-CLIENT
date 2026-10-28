# Page Spec: `Terms`

Jira: HASHI-207

## Purpose

- 사용자가 Hashi에서 적용 중인 약관의 제목과 시행일을 확인하고 각 약관 상세로 이동할 수 있게 한다.
- 기획 명세: HASHI-PLAN `02_PRODUCT_SPEC/MYPAGE/TERMS/TERMS.md` (MY-004), `SPRINT-001_ADDITIONAL_FEATURES.md` §10
- 디자인: Figma `Hashi.kr` > 서비스 전체 화면 > 이용약관 섹션 (node-id 8317-33970), 목록 프레임 8317-97168

## Route

- path: `/terms`
- path constant:
  - `ROUTES.terms`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout` > `BottomNavigationLayout`
- access type:
  - `public`
- guard:
  - none
- lazy loading:
  - `lazyPages.terms`
- bottom navigation:
  - yes (`마이` 탭 활성)
- redirect:
  - unauthenticated: none
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/terms/TermsPage.tsx`
- spec path:
  - `apps/client/src/pages/terms/TermsPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`
  - URL helper: `getTermsDetailPath` in `apps/client/src/app/router/routePaths.ts`

## Requirements

- [x] 상단 Header에 뒤로가기 버튼과 `이용약관` 제목을 고정해 보여준다.
- [x] 뒤로가기는 `navigate(ROUTES.mypage, { replace: true })`을 실행한다.
- [x] 서버에서 공개한 약관을 응답 순서대로 표시한다. 기존 디자인의 약관 종류는: Hashi 이용약관, 개인정보처리방침, 개인정보 수집 및 이용 동의, 개인정보 제3자 제공 동의, 예약 및 취소·환불 정책, 리뷰 운영정책, 포인트 이용약관, 서비스 운영정책.
- [x] 각 행은 `[약관 제목]`과 시행일을 표시하고, 선택 시 해당 약관 상세로 이동한다.
- [x] 목록 아래에 이메일과 카카오톡 채널 문의 정보를 표시한다.
- [x] 비로그인 사용자도 접근할 수 있다.

## Data Dependencies

### Query

- GET /api/v1/terms → getTerms, termsQueryKeys.list(), useQuery. 서버 목록 순서·termsId·제목·시행일·버전을 사용한다.
- loading: Header를 유지하고 LoadingScreen 표시
- error: 로컬 오류 안내와 다시 시도. 상세의 404는 NotFoundPage
- empty: 목록은 등록된 약관 없음, 상세는 등록된 조항 없음
- 공개된 서버 약관만 표시하며 빈 응답에서 정적 약관으로 대체하지 않는다.

### Mutation

- mutation: none

## User Flow

1. 마이페이지 `이용약관` 메뉴에서 `/terms`로 진입한다.
2. 약관 행을 선택하면 `/terms/{policyId}` 상세로 이동한다.
3. 뒤로가기로 마이페이지로 돌아간다.

## State

- local state: none
- URL state: none
- server state: 공개 약관 목록 query cache
- derived state: none

## UI Structure

```text
TermsPage
  Header (back, 이용약관)
  ul > li > button (title, effectiveDate, NextIcon), 서버 응답 개수
  address (이메일, 문의 채널)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
- feature constant:
  - `getTerms`, `termsQueryKeys`
- icon:
  - `BackIcon`
  - `NextIcon`

## Error Handling

- API error: 로컬 오류 안내 및 재시도
- validation error: none
- exceptional case: 빈 목록 안내

## Navigation

- entry:
  - 마이페이지 `이용약관` 메뉴 (`ROUTES.terms`)
- links:
  - 약관 상세: `getTermsDetailPath(policyId)`
- route params: none
- search params: none
- back behavior:
  - `navigate(ROUTES.mypage, { replace: true })`

## Styling

- Tailwind layout:
  - 모바일 단일 컬럼, 행 좌우 20px, 행 상하 28px, `warm-gray-100` 하단 구분선
  - 제목 `typo-sub-header-2 text-[#101010]` (16px), 시행일 `typo-body-7 text-primary-200` (14px), 제목과 시행일 간격 8px
  - 다음 화살표 `NextIcon`은 `size-6 text-cool-gray-900` (24×24px)이며 텍스트 영역 상단에 정렬한다.
  - 문의 정보는 `typo-caption-2 text-warm-gray-300`, 줄높이 18px, 패딩 20px, 하단 여백 18px을 적용한다.
  - 페이지 최소 높이는 `app-mobile-bottom-nav-content`로 하단 내비게이션 영역을 제외한다.
  - 스타일 기준: Figma 이용약관 목록 프레임 (node `8317-97168`), 2026-10-19 목록 제목·간격·정렬 재확인
- fixed area:
  - Header: `app-mobile-fixed-top`
  - 하단 네비게이션: `BottomNavigationLayout`

## Known Gaps

- 2026-10-17 개발 서버 목록 HTTP 200 및 빈 배열 확인. 게시된 상세 데이터가 없어 실제 게시 본문·버전·시행일 확인은 대기한다.
- 구현·자동 테스트와 배포·운영 검증은 별도 상태다.

## Verification

- 단순 표시·이동 테스트는 유지하지 않는다. 목록과 상세에 중복되던 순서 검증도 제거했다.
- 약관 데이터 테스트는 전체 조항의 번호 연속성과 본문 블록 누락을 검사한다.

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 서버 목록·시행일·서버 ID 이동·빈 목록·실패 후 재시도·뒤로가기 자동 테스트
- [x] 비로그인 직접 진입 확인
- [x] 2026-10-14 스타일 검증: 393px 화면에서 8개 행의 화살표 24px, 시행일 14px·`#4A4A4A` 확인. 320px·393px 화면에서 가로 넘침 없음.

## API Integration Map (2026-10-17)

- 읽기 전용 public query, mutation·인증 조건·페이지네이션 없음.
- 서버 응답 타입은 generated OpenAPI에서 파생한다.
- 서버 미게시 약관은 임의 정적 데이터로 대체하지 않는다.
- 목록 행은 서버 termsId로 상세 이동하고 상세는 목록으로 replace 복귀한다.
- 검증: 목록/상세 성공·실패·재시도·빈 응답·잘못된 ID·404·일반 텍스트 안전성 자동 테스트.

- 2026-10-17 검증 결과: 전체 147 files / 711 tests, client lint·typecheck·build 통과.
- 실제 개발 서버 목록 200·빈 결과, terms/1은 SUPPORT-004·HTTP 404 확인. localhost Origin(127.0.0.1:5192) 요청은 서버 403으로 브라우저 실데이터 검증은 CORS 허용 환경에서 추가 필요.

## Design Alignment Verification (2026-10-19)

- 약관 목록·상세 테스트 15개 및 client lint·typecheck·build 통과.
- 393px 브라우저에서 수정된 스타일 확인. 320px 목록·펼친 상세의 가로 넘침 없음. 로컬 API 테스트 응답을 사용했으며 실제 게시 데이터 검증과 배포는 별도다.
