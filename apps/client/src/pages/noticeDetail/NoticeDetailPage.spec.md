# Page Spec: `NoticeDetail`

## 2026-10-08 검증 결과

- `pnpm test`: client 694개(142 파일), HDS 226개(25 파일) 통과.
- `pnpm --filter @hashi/client lint`, `typecheck`, `build`: 통과.
- `git diff --check`: 통과.
- 실제 개발 API 목록은 HTTP 200 및 notices 0건이었다. 항상 게시 공지가 존재한다는 운영 전제를 충족하지 않아, 게시 후 실제 상세·무한 스크롤 확인이 필요하다.
- 모바일 실기기 터치 및 실제 게시 데이터 기반 브라우저 QA는 미실행.

Jira: HASHI-208

## Purpose

- 사용자가 공지사항의 제목, 마지막 수정일, 서식 본문, 첨부 이미지를 확인할 수 있게 한다.
- 기획 명세: HASHI-PLAN `02_PRODUCT_SPEC/MYPAGE/MYPAGE_NOTICE/MYPAGE_NOTICE.md` §3, §4.2, §4.3, §4.4
- 디자인: Figma `Hashi.kr` > 공지사항 섹션 (node-id 8317-34181) 상세 프레임

## Route

- path: `/notices/:noticeId`
- path constant:
  - `ROUTES.noticeDetail`
- route owner: `apps/client/src/app/router/routes.ts`
- layout: `RootLayout` > `BottomNavigationLayout`
- access type:
  - `public`
- guard:
  - none
- lazy loading:
  - `lazyPages.noticeDetail`
- bottom navigation:
  - yes (`마이` 탭 활성)
- redirect: none

## Location

- page path:
  - `apps/client/src/pages/noticeDetail/NoticeDetailPage.tsx`
- spec path:
  - `apps/client/src/pages/noticeDetail/NoticeDetailPage.spec.md`
- page-local components:
  - `components/NoticeContent.tsx`
  - `components/NoticeAttachmentImage.tsx`
  - `components/NoticeImageViewer.tsx`
  - `components/NoticeZoomImage.tsx`

## Requirements

- [x] Header에 뒤로가기와 `공지사항` 제목을 보여준다.
- [x] 공지 제목과 마지막 수정일(`YYYY.MM.DD`, 없으면 게시일)을 보여준다.
- [x] 본문은 굵게, 줄바꿈, 글머리표 목록, 번호 목록, 링크를 지원한다.
- [x] 링크는 HASHI 내부 주소(같은 origin 또는 `/` 경로)면 같은 탭에서 앱 화면으로 이동하고, 외부 `http(s)` 주소는 새 탭(`noopener noreferrer`)에서 연다.
- [x] 서버 `body` 블록의 span.text는 일반 텍스트로 escape한다. HTML처럼 보이는 문자열도 그대로 표시하며 `http(s)`가 아닌 링크는 텍스트로 표시한다.
- [x] 첨부 이미지(최대 10장)를 본문 아래에 등록 순서대로 세로로 보여준다. 가로폭은 콘텐츠 영역에 맞추고 API의 `width`/`height`로 원본 비율을 유지한다.
- [x] 이미지 한 장을 불러오지 못하면 같은 비율 영역에 공통 `ImageFallback`을 보여주고 나머지는 그대로 보여준다. PROCESSING/FAILED 또는 defaultSource가 없으면 URL을 요청하지 않고 대체 화면을 표시한다. 크기 정보가 없는 상태는 1:1 영역을 쓴다.
- [x] 이미지를 선택하면 전체 화면 뷰어를 선택한 이미지부터 열고, 여러 장이면 좌우로 넘겨 볼 수 있다.
- [x] 뷰어는 핀치로 원본~4배 확대·축소하고 확대 상태에서 드래그로 이동한다. 원본 크기에서는 한 손가락 좌우 넘김을 허용한다. 이미지 전환·뷰어 재진입 시 확대를 초기화한다.
- [x] `noticeId`가 양의 정수가 아니거나 존재하지 않는·삭제된 공지(404)면 `NotFoundPage`를 보여준다.
- [x] 목록에서 온 경우 뒤로가기는 `navigate(-1)`로 목록과 스크롤을 복원한다. 직접 진입은 공지 목록으로 replace 이동한다.

## Data Dependencies

### Query

- query:
  - `GET /api/v1/notices/{noticeId}`
- query key:
  - `noticeQueryKeys.detail(noticeId)`
- enabled condition:
  - `noticeId`가 양의 정수일 때
- loading state:
  - `LoadingScreen`
- error state:
  - 404: `NotFoundPage`
  - 그 외: route ErrorBoundary로 throw
- empty state:
  - 응답 `data`가 없으면 API 계약 오류로 처리한다.

## Backend Contract

```ts
// GET /api/v1/notices/{noticeId}
interface NoticeDetail {
  noticeId: number
  title: string
  publishedAt: string
  lastModifiedAt: string
  status: string
  body: {
    type: 'PARAGRAPH' | 'BULLET_LIST' | 'ORDERED_LIST'
    items: { text: string; bold: boolean; href?: string | null }[][]
  }[]
  images: { assetId: string; image: MediaImage }[] // READY의 defaultSource에서 URL·크기를 사용
}
```

2026-10-08 실제 OpenAPI 및 서버 `origin/develop e780c4c7` 기준이다. 타입은 generated 스키마를 기반으로 서버 DTO의 필수 속성/nullable 필드를 보완한다. HASHI-PLAN `1c981e5`를 반영했다.

## Rich Content Rendering

`NoticeContent`는 PARAGRAPH/BULLET_LIST/ORDERED_LIST 및 text/bold/href를 React 요소로 렌더링한다.
DOMParser와 dangerouslySetInnerHTML을 사용하지 않는다. whitespace-pre-wrap으로 줄바꿈을 유지하고, 외부 http(s) 링크에 noopener noreferrer를 적용한다.

## UI Structure

```text
NoticeDetailPage
  Header (back, 공지사항)
  article
    h1 title
    p lastUpdatedDate
    NoticeContent
    ul > li > button(aspect-ratio) > NoticeAttachmentImage
    NoticeImageViewer (open 시)
```

## Styling

- 콘텐츠 영역 좌우 20px
- 제목·날짜는 헤더 아래 최소 100px 영역에서 세로 가운데 정렬하고, 서로 8px 간격을 둔다. 긴 제목은 영역 높이가 늘어나며 본문을 아래로 밀어낸다.
- 제목 `typo-sub-header-2 text-black leading-[1.27] tracking-[-0.01em]`, 날짜 `typo-body-6 text-primary-200 leading-[1.38]` (14px Medium, Figma 날짜 레이어 `8317-34300`, 2026-10-14 확인)
- 한 줄 제목 기준 본문은 헤더 하단에서 100px 아래에 시작한다.
- 페이지 최소 높이는 `app-mobile-bottom-nav-content`로 하단 내비게이션 높이를 제외한다.
- 제목 자간 -1%는 최신 Figma `9343-111979` 기준 (2026-10-19).
- 본문 `typo-caption-2` + 행간 150% + `text-black` (Figma Caption 2, `#000`), 목록 들여쓰기 18px
- 첨부 이미지: 본문과 20px 간격, 이미지 사이 8px

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 구조화된 본문·링크·일반 텍스트 HTML escape, 이미지 순서·비율·로드 실패, 뷰어 열기·닫기, 잘못된 id, 404, 뒤로가기 테스트

- 핀치 확대·축소, 이동 경계, 원본 크기 스와이프 전달은 `NoticeZoomImage.test.tsx`로 검증한다. 실제 모바일 터치 검증은 대기 중이다.

- 직접 진입 뒤로가기는 `/notices` replace, 목록 경유 뒤로가기는 `navigate(-1)`임을 회귀 테스트로 검증한다.

- 2026-10-17 Figma 공지사항 섹션 `8317:34181` 원본을 직접 열어 목록·상세 구성과 기존 스타일 명세를 재확인했다. 이번 수정은 탐색 동작 회귀 테스트 복구이며 화면 구현 변경은 없다.

## API Integration Verification (2026-10-17)

- 최신 user OpenAPI와 NoticeResponse·NoticeBlock·Span·Attachment·MediaImage 타입 일치 확인.
- 구조화된 일반 텍스트와 안전한 링크를 렌더링하며 READY 이미지의 defaultSource만 사용한다.
- 실제 게시 공지가 없어 상세 실데이터·첨부 이미지·모바일 제스처 확인은 대기한다.

- 2026-10-17 전체 142 files / 694 tests, lint·typecheck·build 통과. 빈 목록 안내 추가 테스트를 포함한 목록 12 tests 별도 통과.
- localhost Origin(127.0.0.1:5192) 요청은 서버 HTTP 403 확인. 브라우저 실데이터 확인은 CORS 허용 환경에서 추가 필요.

## Design Alignment Verification (2026-10-19)

- 공지 목록·상세 테스트 22개 및 client lint·typecheck·build 통과.
- 393px 브라우저에서 수정된 스타일 확인. 로컬 API 테스트 응답을 사용했으며 실제 게시 데이터 검증과 배포는 별도다.
