# MapPage

Jira: HASHI-215. Status: Google Maps JavaScript SDK integrated; restaurant data/coordinates remain explicitly labelled samples. Restaurant API integration is deferred.

## 2026-10-13 추가 유즈케이스 설계 — 구현 전 검토

이 절은 다음 구현의 목표이며 아직 구현 완료를 의미하지 않는다. 아래 기존 영문 절은 현재 구현 기준선이다. 서로 다른 내용은 이번 구현에서 이 절로 대체하고, 구현 완료 후 이전 기준선을 정리한다.

### 기준과 범위

- HASHI-PLAN `846b38a`의 MAP_MAIN, MAP_FILTERED, MAP_RESTAURANT_DETAIL을 기준으로 한다.
- 사용자 확정: 지역 묶음 복원은 최신 MAP_MAIN을 따른다. DEC-001의 최초 진입 한정 규칙은 이번 구현에 적용하지 않는다.
- 사용자 확정: 빈 결과는 그림에 남은 핀이 아니라 기획 문서의 핀 제거 규칙을 따른다.
- 사용자 확정: 카테고리 순서는 현재 코드의 `전체 → 음식점 → 주점 → 카페`를 유지한다.
- Figma 추가 유즈케이스: [재검색](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=10043-182001), [스피너](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=10057-135279), [오류](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=9984-85562), [토스트](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=10043-183098), [검색 X](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=9984-55671), [상세 닫기](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=9965-71086).
- 지도와 검색의 프론트 동작, 화면 상태, 복원 흐름을 구현한다. 컬렉션 자체 및 예약 기능의 신규 구현은 제외한다.
- 실제 식당 API 지원 여부는 구현 전 계약을 확인한다. 확인되지 않은 endpoint나 좌표 필드를 만들지 않는다. 미지원 기능은 샘플 데이터 경계를 유지하고 실연동 완료로 표시하지 않는다. 오류·추가 조회는 테스트 대역으로 검증하며 운영 화면에 가짜 오류나 성공을 만들지 않는다.

### 지도·조회 상태 분리

- 현재 카메라(center/zoom/bounds), 마지막 조회 조건(bounds/keyword/category/sort/region), 결과, 선택 식당, 목록·상세 패널 상태를 별도로 관리한다.
- 지역 묶음 표시 여부는 조건과 줌에서 파생한다. 기존 `isExploring`을 영구 전환 플래그로 사용하지 않는다.
- 사용자 조작과 프로그램 이동(최초 fit, 지역 선택, 검색 결과 fit, 복원)을 구분한다. 프로그램 이동은 재검색 버튼이나 사용자 이동 처리를 발생시키지 않는다.
- 최초 fit에서 얻은 최소 줌은 이후 지역·상세 선택이나 패널 높이 변경으로 덮어쓰지 않는다.
- 검색어·카테고리가 없으면 줌 13 이하에서 현재 viewport 안의 지역 묶음을 표시하고, 줌 14 이상에서 개별 핀을 표시한다. 13과 14 사이 소수 줌에서는 직전 표시 모드를 유지한다. 초기 진입은 지역 묶음, 지역 클릭은 개별 핀으로 시작한다.
- 검색어 또는 카테고리가 있으면 줌과 관계없이 개별 핀을 표시한다. 조건 해제 시 현재 줌에 따라 표시 모드를 다시 판단한다.
- 지역 묶음 복원 시 현재 중심을 유지한다. 최초 영역으로 이동하는 것은 명시적 초기화 때만 수행한다.
- 지도 사용자 조작 시작 시 목록 패널을 최소 높이로 축소한다. 상세가 열려 있으면 상세 패널을 축소하되 선택은 유지한다. 기존 핀·목록은 자동 재조회하지 않는다.
- 지역 선택 후 최초 사용자 이동 시 지역 조건을 해제한다. 이동 전 카테고리 적용은 선택 지역 범위를 사용하고, 이동 후 조건 변경은 현재 viewport를 사용한다.

### 재검색·검색 연결

- `현재 위치에서 검색`은 위치 아이콘을 포함한 Figma 버튼을 사용한다. 카테고리가 적용되어 있고 사용자 이동 후 마지막 조회 영역과 현재 영역이 다를 때만 표시한다.
- 최초 로딩, 지역 클릭, 결과 fit 및 복원으로는 버튼을 표시하지 않는다. 요청 시작 즉시 숨기며 조건·조회 영역을 고정한다.
- 검색창은 기존 `/search`로 이동한다. 지도 진입 맥락과 적용 검색어를 전달하고, 검색 실행 시 `/map`으로 돌아와 카테고리를 유지한 검색을 적용한다. 일반 검색 진입 동작은 바꾸지 않는다.
- 경로 문자열은 ROUTES를 재사용한다. 지도 복귀용 route state는 유효성을 검사하며 누락·잘못된 state는 일반 검색으로 처리한다. 새로운 전역 URL 규약은 추가하지 않는다.
- 검색 입력 X는 입력값을 비운다. 지도에 적용된 검색어를 해제하는 동작은 현재 viewport를 유지한 첫 페이지 재조회로 연결한다. 단순 입력 draft 변경과 적용 조건 변경을 구분한다.
- 검색 결과 1개는 해당 식당으로 이동하고, 여러 개는 전체 결과가 보이게 fit한다. 결과가 없으면 현재 카메라를 유지한다.
- 카테고리 재선택은 해당 필터를 해제한다. 카테고리·정렬·검색 변경은 목록 스크롤, 기존 결과와 핀을 초기화하고 첫 페이지를 조회한다.
- 조회마다 식별자를 부여하여 최신 조건의 결과만 반영한다. 조건 변경 전 추가 조회 결과도 폐기한다. 동일 다음 페이지 중복 요청 및 중복 식당 추가를 막는다.
- 조회 도중 사용자가 지도를 이동하면 성공 응답 시 요청 당시 카메라로 복귀한다. 검색 결과의 1개 이동/여러 개 fit은 그 다음 적용한다. 실패 시 현재 지도를 강제 이동하지 않는다.
- 실제 데이터 계약이 지원하면 최초 10개와 다음 10개를 조회한다. 지도 핀은 로드된 목록과 동일한 결과를 사용한다. 계약 미지원 시 실제 페이지네이션으로 주장하지 않는다.

### UI 상태와 재시도

| 상황                         | 화면 및 동작                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| 지도 SDK 로딩                | 지도 중앙 스피너, 접근 가능한 로딩 안내                                                                 |
| 지도 실패                    | `지도를 불러오지 못했어요.` 및 `다시 시도하기`; SDK 재초기화가 필요한 경우 기존 페이지 재로드 방식 유지 |
| 목록 최초·재조회 로딩        | 이전 목록·핀 제거, 지도·목록 영역 스피너                                                                |
| 목록 최초·재조회 실패        | 지도·조건 유지, 시트에 `식당 목록을 불러오지 못했어요.` 및 동일 요청 재시도                             |
| 추가 조회 실패               | 기존 목록·핀 유지, 목록 하단에서 실패한 다음 페이지 재시도                                              |
| 영역 재검색 결과 없음        | 지도 유지, 핀 제거, 목록 시트를 최소 높이로 축소, `이 지역에는 아직 등록된 맛집이 없어요.` 토스트 1회   |
| 검색·카테고리 조건 결과 없음 | 조건 유지, 핀 제거, 일반 높이 시트에 빈 결과 안내, `조건에 맞는 맛집이 없어요.` 토스트 1회              |
| 상세 조회 실패               | 상세 닫기, 직전 지도·목록 복원, `식당 정보를 불러오지 못했어요.` 토스트; 재선택으로 재시도              |

- 빈 결과 분기는 요청 원인으로 정한다. 재검색 버튼은 지역 안내, 검색·카테고리 변경은 조건 안내를 사용한다. 정렬·추가 조회는 현재 결과 집합의 빈 상태 종류를 유지한다.
- 토스트는 렌더링마다 반복하지 않고 최신 요청의 결과 이벤트마다 1회 표시한다. 오래된 응답은 토스트도 표시하지 않는다.
- 공통 토스트·버튼·아이콘을 재사용한다. 문구와 요청 재시도 책임은 페이지에 둔다. 스피너는 reduced-motion과 보조기기 안내를 고려한다.

### 상세·복원 정책

- 상세 표시 중 지도 왼쪽 북마크는 닫기 X로 대체한다. 확장 상세에서도 키보드로 접근 가능한 닫기 동작을 유지한다.
- 선택 전에 카메라·목록 시트 상태를 기록한다. X로 닫으면 이를 복원하고 선택을 해제한다. 목록 스크롤과 상세 내부 탭·스크롤은 닫기 후 복원 대상이 아니다.
- 상세 재진입은 기본 정보 탭에서 시작한다. 사진 모달의 포커스 복원과 확장 상세의 배경 격리는 유지한다.
- 예약 화면을 실제로 연결하는 시점에는 취소·복귀 시 상세 탭·스크롤·시트 높이 복원을 지원해야 한다. 미연동 상태에서 예약 성공이나 이동을 모방하지 않는다.
- 탭 이탈 또는 백그라운드 전환 시각부터 5분 미만이면 카메라·조건·로드된 결과·선택·시트 상태를 복원한다. 정확히 5분 이상이면 만료로 처리한다.
- 이탈 시점은 중복 이벤트로 연장하지 않는다. 복귀하면 만료 여부를 판정하고 다음 이탈을 새로 기록한다. 복원 중 진행 중이던 요청은 성공 결과처럼 저장하지 않는다.
- 세션은 앱 메모리에 보관한다. 새로고침·새 브라우저 탭 간 지속 보존은 이번 범위가 아니다. 토큰·개인정보를 새 저장소에 넣지 않는다.
- 활성 지도 탭 재선택은 즉시 조건·결과·선택·세션을 초기화하고 최초 지역 묶음으로 돌아간다. 다른 탭에서 지도 진입은 일반 복원 정책을 따른다.

### 책임과 예정 파일

- `MapPage.tsx`: 화면 조립, 라우트 진입·복귀와 패널 연결.
- `hooks/useMapPageState.ts`: 기존 `useMapPreviewState.ts`를 대체하는 조건·선택·조회 흐름. 이전 훅을 중복 유지하지 않는다.
- `hooks/useGoogleMapCamera.ts`: SDK 카메라, 사용자/프로그램 이동 구분, 초기 fit·검색 fit·복원.
- `hooks/useMapSession.ts`: 페이지별 스냅샷 저장·5분 만료. app 레이어에서 페이지 훅을 직접 조작하지 않고 라우트 진입 이벤트로 초기화를 전달한다.
- `utils/mapDisplayPolicy.ts`: 줌 임계값과 지역 묶음/핀 전환 순수 함수.
- `components/MapViewport.tsx`: 지도·마커 표시. 조건·조회 상태는 상위에서 주입한다.
- `components/MapSearchAreaButton.tsx`, `components/MapStatusView.tsx`: 페이지 전용 버튼 및 상태 표시. 상태 표시 컴포넌트는 요청을 직접 실행하지 않는다.
- 기존 `MapToolbar`, `MapRestaurantList`, `MapRestaurantDetail`은 유지하며 필요한 props만 조정한다. 샘플 데이터는 기존 data 모듈 밖으로 퍼뜨리지 않는다.
- `/search` 및 `BottomNavigationLayout`은 지도 진입·복귀·재선택 연결만 변경한다. 검색 페이지가 map 페이지 내부 훅을 import하지 않는다. 실제 공유가 필요한 검색 맥락 계약만 feature 경계로 분리한다.
- 공통 DragPanel을 계속 사용한다. HDS에는 지도 조건·라우트·API·제품 문구를 넣지 않는다. 새 상태 관리 라이브러리를 추가하지 않는다.

### 완료 판정 및 검증 계획

- 단위 테스트: 줌 13/14와 소수 구간, 필터/검색 예외, 초기 최소 줌 유지, 요청 원인별 빈 상태, 마지막 응답만 반영, 동일 페이지 중복 요청 방지.
- 세션 테스트: 5분 미만/정확히 5분/이후, 연속 이탈 이벤트, 탭 재선택 초기화, 검색 복귀와 일반 검색 회귀.
- 컴포넌트 테스트: 재검색 버튼 조건, 각 오류 재시도, 토스트 중복 방지, 상세 X/북마크 교체, 포커스 복원, 지도 조작 시 패널 축소.
- E2E: 지역 선택→축소 복원, 카테고리 상태의 축소, 검색 0/1/다수 결과, 상세 닫기 카메라 복원, 탭 복귀, 모바일 패널/지도 드래그 분리, Google 로고·저작권 가림 여부.
- `pnpm --filter @hashi/client lint`, `typecheck`, `build`, 관련 단위 테스트 및 지도·검색 E2E, `git diff --check`를 실행한다. 이 목록은 실행 예정이지 통과 기록이 아니다.
- API 계약 미지원과 실제 브라우저에서 검증하지 못한 항목은 완료 보고에서 별도 표기한다. UI 테스트 통과를 실제 API 연동 완료로 표현하지 않는다.

## Purpose / Route

- `/map` (`ROUTES.map`), public, lazy page under BottomNavigationLayout. No new guard, redirect or query parameter.
- Inspect Tokyo sample restaurants using area markers, category/search filters, a draggable list and selected restaurant details.
- Figma: https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-32364.
- Marker components: `8317:38190`; shared map shadow: `8317:40821`; map CTA states: `8317:40775` in the same file. Collection covers, collection pins and collection selection controls are outside this page's scope.

## Data Dependencies

- Google Maps via @vis.gl/react-google-maps, using VITE_GOOGLE_MAPS_API_KEY and VITE_GOOGLE_MAPS_MAP_ID. No keys in source. Missing configuration, SDK/network timeout and authentication failure show a retry action (page reload, because SDK initialization is singleton).
- Local, explicitly labelled sample restaurants. No geolocation, Places search, backend bounding-box query, save or reservation mutation.
- Area labels in Figma include neighborhoods (우에노, 아사쿠사, 긴자), not only administrative wards. Sample areaCode is a local identifier, NOT a Japanese ward code.
- Markers use latitude/longitude on the real map, but these sample coordinates are NOT verified restaurant locations. Counts derive from sample data. Regional summaries are not an automatic clustering algorithm.
- Saved-list/save/reservation actions show the existing ComingSoonDialog. They do not navigate using fake restaurant ids or show successful saving.

## Requirements / State

- First view: search, 전체/음식점/주점/카페, area markers, floating saved action, ranked recommendations.
- Overview and exploration are explicit states, independent of panel height. After choosing an area/category/search or restaurant, only individual category pins remain until an explicit reset. No automatic marker clustering.
- Direct user zoom to level 14 or above also enters exploration after camera movement settles. Zooming back out keeps individual pins and existing search conditions/results; only explicit reset restores area markers. Initial fitting and automatic camera moves do not trigger this transition. This display change does not query or filter restaurants.
- The fitted initial camera zoom is the minimum zoom. Region labels reserve non-overlapping screen space without changing geographic anchors; displaced labels have a connector to the original anchor.
- A restaurant/region selected before SDK readiness waits for the initial fit to finish, so its detail zoom cannot become the minimum. Zoom-out remains available to the initial overview level after selection.
- `현 지도에서 검색` keeps the existing provisional button design. It appears after user map movement, not initial fitting, region selection or selected-restaurant centering.
- Area click centers/zooms the real map and filters sample restaurants. A reset action fits all sample regions. Category and submitted keyword apply together. Sort: recommended, rating, reviews, deterministic recommendation tie-break.
- Search draft is separate from submitted keyword; empty results provide reset. Filter changes clear selected restaurant. Same selected category toggles to all.
- Local state: draft, applied keyword/category/area/sort, selected restaurant id, panel stage, photo index, coming-soon dialog. No URL or server state is introduced.
- List collapse/expand preserves scroll. Changes to keyword/category/area/sort reset list scroll. Selecting a restaurant keeps the list mounted; closing details restores the previous list and conditions.
- An expanded list exposes `지도로 보기` in the panel footer. It collapses the list to the handle without resetting conditions or scroll; focus returns to the handle. It is not shown in normal/collapsed or restaurant-detail states.
- `지도로 보기` only collapses the list. Moving/zooming the map exposes `현 지도에서 검색`; only clicking it applies the latest idle bounds to the sample list. It clears the prior area filter/selection but preserves keyword/category/sort. No map reload or backend request is needed for this local filter. Empty results retain the map and offer reset.
- Selecting a marker/card opens restaurant summary. Expanding shows information/menu/photo/review tabs, sticky title and tabs, and bottom reserve action. Unavailable menu/review data is described as preview/unconnected, not as a real server result.
- Photo selection opens a modal carousel; Escape/close restores focus to the source thumbnail. Background is inert while photo modal is open.
- Long titles truncate to one line with the full accessible name. Thumbnail failure uses HDS fallback.

## Layout Contract

- Frame: 393×852. OS status bar is not drawn. Top content uses safe-area + 12px.
- Figma first list: 396px including 84px navigation → DragPanel normalHeight=312.
- Category list: 388−84=304px; selected summary: 378−84=294px.
- General expanded list: 794−84=710px at the design viewport; adapt to viewport excluding safe-area/status region, leaving 12px top spacing.
- Filtered expanded list leaves search and chips visible: Figma top=170 (45px OS bar + 125px content).
- Collapsed: DragPanel's 30px handle. App owns normal/max heights and the container excluding bottom nav (84px + safe-area).
- On short screens, the normal list shrinks to reserve 400px for the map where possible. Overview can shrink to the 30px handle; exploration retains at least 156px for the result heading/card where space permits. Users can expand the list. This avoids fitting all regions into the tiny space left between search and sheet.
- Markers share the original restaurant/cafe/bar SVG glyphs: 20px normal / 31px selected circles with per-category optical offsets. Selected labels use Caption 1 title and Caption 2 rating with a 12px star. Normal shadows are rendered in CSS, not baked into images. Both states retain at least 44px hit areas.
- Search, category chips, selected marker and floating actions use `0 0 4px rgba(0,0,0,.2)` per the shared shadow note; the region silhouette retains equivalent CSS drop-shadow (2px standard deviation). The CTA retains its separate 4px Y-offset shadow, 44px height, 24px icon and Body 6 text.
- Expanded restaurant detail fills the mobile frame above the bottom action and covers the underlying navigation. The background/list is inert while this full-screen detail is visible; close restores it. DragPanel footer owns reserve action; no nested vertical scroller.
- Title sticky top=0, tab row sticky below title in DragPanel scroll body. No internal DOM query, HDS scroll override or page-window scroll handler.
- Small viewport heights clamp normal/max stages. Touch drag only starts on the handle; ordinary content gestures scroll the body.

## Component Mapping / Public API

- HDS DragPanel (HASHI-214), Dialog, SearchBar, Chip, IconButton, Button, Thumbnail, Tabs, Carousel.
- Normal panels stay nonmodal. Expanded details and photos use HDS Dialog for focus containment and background isolation.
- Reuse HDS icons and app ComingSoonDialog. RestaurantDetailTemplate is not used because it owns window scrolling and photo API queries.
- Page-local toolbar, map preview, cards, list, detail and photo viewer; no new package public API.
- Sample photos live under shared/assets/images/map/preview. Static map backgrounds are no longer rendered. Restaurant images are props on preview records. Marker glyphs, the CTA icon and area tail are imported from @hashi/hds-icons.

## File Responsibilities

- `MapPage.tsx`: composes toolbar, viewport, list/detail panels and dialogs.
- `hooks/useMapPreviewState.ts`: owns preview input/selection state and supplies restaurant and area data.
- `data/mapPreviewRestaurants.ts`: explicitly temporary sample restaurants/areas; UI components do not import it directly.
- `utils/filterMapRestaurants.ts`, `utils/getMapAreaMarkers.ts`: pure filtering/sorting and area counts. Counts represent all supplied sample restaurants, independently of the active filters.
- `utils/layoutMapAreaLabels.ts`: screen-space region label offsets using map zoom; never changes geographic anchors.
- `components/MapViewport.tsx`: SDK provider, loading/failure state, geographic markers and explicit viewport search. Google attribution stays above the sheet because map height excludes the panel.
- `hooks/useGoogleMapCamera.ts`: initial/reset overview, area selection and selected restaurant camera movement without recreating the map on filter/panel changes.
- `components/MapAreaMarker.tsx`, `components/MapRestaurantMarker.tsx`: area and restaurant selection UI.
- `components/MapRestaurantMeta.tsx`, `components/MapRestaurantImages.tsx`, `components/MapSaveAction.tsx`: page-local parts shared by cards and details. Details do not import parts through the card module.
- `@hashi/hds-icons` exports RestaurantMarkerIcon, CafeMarkerIcon, BarMarkerIcon, MapViewIcon and MapPinTailIcon: original reusable vector artwork only. The app supplies size/color/disabled styling; routing, selection and sample data remain page-local.

## Verification

- Test filter intersection, sorting/ties, immutable data, empty/reset, selection/close, keyboard panel stages, photo modal, unavailable action feedback and direct public route.
- Client lint/typecheck/full tests/build; DragPanel regression tests; diff check.
- Browser QA: 320/393/768px, 11 Figma states, long title, thumbnail fallback, background and handle interaction, list scroll preservation/reset, sticky title/tabs, focus and reduced viewport.
- Unit tests isolate the external SDK and verify bounds filtering, state transitions and failure states. Live browser validation depends on API enablement/billing/referrer restrictions. Backend correctness and on-device keyboard behavior are not covered.
