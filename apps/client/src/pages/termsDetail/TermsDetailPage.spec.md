# Page Spec: `TermsDetail`

Jira: HASHI-207

## Purpose

- 사용자가 선택한 약관의 제목, 최종 업데이트 일자, 조항 본문을 확인할 수 있게 한다.
- 기획 명세: HASHI-PLAN `02_PRODUCT_SPEC/MYPAGE/TERMS/TERMS.md` §4.2
- 디자인: Figma `Hashi.kr` > 이용약관 섹션의 `page_*` 상세 프레임 (예: page_terms_detail 8317-34124), 본문은 "이용약관 텍스트 전문" (8317-34596)

## Route

- path: `/terms/:policyId`
- path constant:
  - `ROUTES.termsDetail`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout` > `BottomNavigationLayout`
- access type:
  - `public`
- guard:
  - none
- lazy loading:
  - `lazyPages.termsDetail`
- bottom navigation:
  - yes (`마이` 탭 활성)
- redirect: none
- auth status:
  - uses `useAuthStatus`: no

## Location

- page path:
  - `apps/client/src/pages/termsDetail/TermsDetailPage.tsx`
- spec path:
  - `apps/client/src/pages/termsDetail/TermsDetailPage.spec.md`
- route registration:
  - `apps/client/src/app/router/path.ts`
  - `apps/client/src/app/router/lazy.ts`
  - `apps/client/src/app/router/routes.ts`

## Requirements

- [x] Header에 뒤로가기, 약관 제목, `최종 업데이트: YYYY. MM. DD` 부제를 표시한다.
- [x] 서비스 운영정책은 목록에서 `서비스 운영정책`, 상세 헤더에서 `서비스 운영 정책`으로 표시한다.
- [x] 조항은 HDS `Accordion`으로 표시하고 기본은 모두 접힌 상태다.
- [x] 조항을 펼치면 서버의 일반 텍스트와 줄바꿈을 그대로 표시한다.
- [x] 존재하지 않는 `policyId`는 `NotFoundPage`를 표시한다.
- [x] 뒤로가기는 `navigate(ROUTES.terms, { replace: true })`로 목록으로 돌아간다.

## Data Dependencies

### Query

- GET /api/v1/terms/{termsId} → getTermsDetail, termsQueryKeys.detail(termsId), useQuery. policyId route param은 양의 안전한 정수 termsId로 검증한다.
- loading: Header를 유지하고 LoadingScreen 표시
- error: 로컬 오류 안내와 다시 시도. 상세의 404는 NotFoundPage
- empty: 목록은 등록된 약관 없음, 상세는 등록된 조항 없음
- 서버 clauses의 heading/content를 Accordion과 줄바꿈 보존 일반 텍스트로 표시한다. HTML은 실행하지 않는다.

### Mutation

- mutation: none

## State

- local state: 각 Accordion의 펼침 상태 (HDS uncontrolled)
- URL state:
  - `policyId`

## UI Structure

```text
TermsDetailPage
  Header (back, title, subtitle)
  ul > li > Accordion(title) > p(content, whitespace-pre-wrap)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Accordion`
- feature util:
  - `getTermsDetail`, `termsQueryKeys`
- 조항 본문: 서버 `content`를 일반 텍스트 문단으로 렌더링
- icon:
  - `BackIcon`

## Error Handling

- exceptional case:
  - 알 수 없는 `policyId` → `NotFoundPage`

## Navigation

- entry:
  - 이용약관 목록 행
- route params:
  - `policyId`: 양의 정수 서버 termsId
- back behavior:
  - `navigate(ROUTES.terms, { replace: true })`

## Styling

- 헤더 아래 조항 목록에 24px 상단 여백 (`pt-6`)을 둔다. 상태 표시줄을 제외한 조항 시작 위치는 y=99px (Header 75px + 여백 24px). Figma `9343-110036`, 2026-10-19 확인.

- Accordion 본문은 HDS 기본 `typo-caption-2 text-warm-gray-300 leading-[1.5]` (12px, 줄높이 18px)를 사용하며 페이지에서 `contentClassName`으로 덮어쓰지 않는다.
- 본문 스타일 기준: Figma `UI [디자인 2차 스프린트]` 본문 텍스트 (node `9343-111141`), 2026-10-14 확인
- Header와 조항 목록 사이 간격은 24px이다.
- 접힌 Accordion 행 높이는 48px이다. 공통 컴포넌트는 변경하지 않고 페이지에서 `pb-1.75`로 테두리를 포함한 높이를 보정한다.
- Hashi 이용약관 헤더의 제목·부제는 `text-black`, 나머지 약관은 Header 기본 `text-primary-200`을 사용한다.
- 페이지 최소 높이는 `app-mobile-bottom-nav-content`로 하단 내비게이션 영역을 제외한다.
- 본문은 `whitespace-pre-wrap`으로 서버 원문의 줄바꿈을 유지한다.
- fixed area: Header `app-mobile-fixed-top`, 하단 네비게이션은 layout이 담당

## Content Source

- 공개 약관 API의 제목·시행일·조항을 사용한다. 기존 Figma 정적 원문은 API 빈 결과나 실패 시 대체하지 않는다.
- 서버 content는 일반 텍스트다. 번호/불릿도 원문 텍스트로 유지하고 HTML을 실행하지 않는다.

## Known Gaps

- 2026-10-17 개발 서버 목록 HTTP 200 및 빈 배열 확인. 게시된 상세 데이터가 없어 실제 게시 본문·버전·시행일 확인은 대기한다.
- 구현·자동 테스트와 배포·운영 검증은 별도 상태다.

## Verification

- 단순 표시·이동 및 공통 Accordion 동작을 반복 검증하는 페이지 테스트는 유지하지 않는다.
- 약관 테스트는 서버 응답과 잘못된 ID·404·빈 결과·실패 후 재시도 등 예외 처리를 검증한다. 미사용 정적 원문과 전용 렌더러·타입·테스트는 유지하지 않는다.

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 서버 상세·조항 펼침·일반 텍스트 안전성·유효/잘못된 ID·404·빈 조항·재시도·뒤로가기 자동 테스트
- [x] 2026-10-14 스타일 검증: Hashi 이용약관 제1조 본문 12px·`#B3B3B3`·줄높이 18px, 320px·393px 화면에서 가로 넘침 없음. 펼침·접힘과 목록 복귀 확인.

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
