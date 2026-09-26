# Page Spec: `NoticeDetail`

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

## Requirements

- [x] Header에 뒤로가기와 `공지사항` 제목을 보여준다.
- [x] 공지 제목과 마지막 수정일(`YYYY.MM.DD`, 없으면 게시일)을 보여준다.
- [x] 본문은 굵게, 줄바꿈, 글머리표 목록, 번호 목록, 링크를 지원한다.
- [x] 링크는 HASHI 내부 주소(같은 origin 또는 `/` 경로)면 같은 탭에서 앱 화면으로 이동하고, 외부 `http(s)` 주소는 새 탭(`noopener noreferrer`)에서 연다.
- [x] 허용하지 않은 태그는 태그만 제거하고 텍스트는 남긴다. `script`, `style`, `iframe`, `img` 등은 내용까지 제거하고, `http(s)`가 아닌 링크는 텍스트로만 표시한다.
- [x] 첨부 이미지(최대 10장)를 본문 아래에 등록 순서대로 세로로 보여준다. 가로폭은 콘텐츠 영역에 맞추고 API의 `width`/`height`로 원본 비율을 유지한다.
- [x] 이미지 한 장을 불러오지 못하면 같은 비율 영역에 공통 `ImageFallback`을 보여주고 나머지는 그대로 보여준다.
- [x] 이미지를 선택하면 전체 화면 뷰어를 선택한 이미지부터 열고, 여러 장이면 좌우로 넘겨 볼 수 있다.
- [ ] 뷰어 핀치 확대·축소: HASHI-213에서 공용 이미지 뷰어로 구현한다.
- [x] `noticeId`가 양의 정수가 아니거나 존재하지 않는·삭제된 공지(404)면 `NotFoundPage`를 보여준다.
- [x] 뒤로가기는 `navigate(-1)`로 목록으로 돌아가며, 목록은 스크롤 위치를 복원한다.

## Data Dependencies

### Query

- query:
  - `GET /api/v1/notices/{noticeId}` (가계약)
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

## Backend Contract (가계약)

```ts
// GET /api/v1/notices/{noticeId}
interface NoticeDetail {
  noticeId: number
  title: string
  publishedAt: string
  updatedAt: string | null
  content: string // 허용 태그 HTML: strong, b, br, p, ul, ol, li, a
  images: { url: string; width: number; height: number }[]
}
```

본문 형식(허용 태그 HTML)과 이미지 크기 필드는 백엔드에 제안한 상태다. Markdown으로 확정되면 `NoticeContent`만 교체한다.

## Rich Content Rendering

`NoticeContent`는 `DOMParser`로 본문을 파싱한 뒤 허용 태그만 React 요소로 다시 만든다.
`dangerouslySetInnerHTML`을 쓰지 않으며, 파싱용 문서에는 브라우징 컨텍스트가 없어 script와 이벤트 속성이 실행되지 않는다.

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

- 본문 영역 좌우 20px, 상단 24px
- 제목 `typo-sub-header-2 text-black`, 날짜 `typo-body-6` + `#7b7b7b`
- 본문 `typo-caption-2` + 행간 150% + `text-black` (Figma Caption 2, `#000`), 목록 들여쓰기 18px
- 첨부 이미지: 본문과 20px 간격, 이미지 사이 8px

## Verification

- [x] `pnpm --filter @hashi/client lint`
- [x] `pnpm --filter @hashi/client typecheck`
- [x] `pnpm --filter @hashi/client build`
- [x] `pnpm --filter @hashi/client test`
- [x] 서식 본문·링크·허용 외 태그 제거, 이미지 순서·비율·로드 실패, 뷰어 열기·닫기, 잘못된 id, 404, 뒤로가기 테스트
