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
- [x] 조항을 펼치면 문단과 번호/불릿 목록(중첩 포함)을 표시한다.
- [x] 존재하지 않는 `policyId`는 `NotFoundPage`를 표시한다.
- [x] 뒤로가기는 `navigate(ROUTES.terms, { replace: true })`로 목록으로 돌아간다.

## Data Dependencies

### Query

- query: none (`findTermsPolicy(policyId)`로 정적 콘텐츠 조회)

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
  ul > li > Accordion(title) > TermsClauseContent(blocks)
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Accordion`
- feature util:
  - `findTermsPolicy`
- page-local component:
  - `TermsClauseContent`
- icon:
  - `BackIcon`

## Error Handling

- exceptional case:
  - 알 수 없는 `policyId` → `NotFoundPage`

## Navigation

- entry:
  - 이용약관 목록 행
- route params:
  - `policyId`: `TermsPolicyId`
- back behavior:
  - `navigate(ROUTES.terms, { replace: true })`

## Styling

- Accordion 본문은 HDS 기본 `typo-caption-2 text-warm-gray-300 leading-[1.5]` (12px, 줄높이 18px)를 사용하며 페이지에서 `contentClassName`으로 덮어쓰지 않는다.
- 본문 스타일 기준: Figma `UI [디자인 2차 스프린트]` 본문 텍스트 (node `9343-111141`), 2026-10-14 확인
- 목록은 `list-decimal` / `list-disc`, 들여쓰기 18px이며 항목 사이에 추가 간격을 두지 않는다.
- Hashi 이용약관 제2조의 안내 문장 뒤에는 원문의 빈 줄을 `blankLineAfter`로 표시해 18px 여백을 둔다. 다른 문단에는 일괄 간격을 추가하지 않는다.
- Header와 조항 목록 사이 간격은 24px이다.
- 접힌 Accordion 행 높이는 48px이다. 공통 컴포넌트는 변경하지 않고 페이지에서 `pb-1.75`로 테두리를 포함한 높이를 보정한다.
- Hashi 이용약관 헤더의 제목·부제는 `text-black`, 나머지 약관은 Header 기본 `text-primary-200`을 사용한다.
- 페이지 최소 높이는 `app-mobile-bottom-nav-content`로 하단 내비게이션 영역을 제외한다.
- fixed area: Header `app-mobile-fixed-top`, 하단 네비게이션은 layout이 담당

## Content Source

- 개인정보 제3자 제공 동의 제6조는 Figma 이용약관 화면의 펼친 아코디언 원문(node `8317-34105`)을 사용한다. 동의 거부 권리와 예약 대행 서비스 이용 제한 안내를 표시한다. 원문 섹션의 닫힌 아코디언만으로 본문 부재를 판단하지 않는다.

## Known Gaps

- 최신 게시 약관 조회 API 연결은 계약 확인 대기다. 2026-09-30 서버 `develop` (`053fdb3`) 및 열린 PR에서 약관 endpoint를 찾지 못했으며, dev-api OpenAPI 조회는 타임아웃이었다. 현재 Figma 정적 원문을 제공하고 서버 게시 상태·버전·조회 오류는 검증하지 못한다.

- Figma 상세 헤더의 `최종 업데이트: 2006. 06. 29`는 오타로 보고 목록의 시행일 `2026.06.29`를 사용한다.

## Verification

- 단순 표시·이동 및 공통 Accordion 동작을 반복 검증하는 페이지 테스트는 유지하지 않는다.
- 약관 데이터 테스트는 전체 조항의 번호 연속성과 본문 블록 누락을 검사한다.

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 8개 약관 상세 진입, 조항 펼침/접힘, 중첩 목록, NotFound, 뒤로가기 확인
- [x] 2026-10-14 스타일 검증: Hashi 이용약관 제1조 본문 12px·`#B3B3B3`·줄높이 18px, 320px·393px 화면에서 가로 넘침 없음. 펼침·접힘과 목록 복귀 확인.
