# HASHI-215 지도 퍼블리싱 구현 계획

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task after review. No subagent execution is requested.

**Goal:** 지도 Figma의 목록·선택·상세 흐름을 샘플 데이터로 확인할 수 있게 구현한다.

**Architecture:** HASHI-214의 HDS DragPanel을 재사용한다. 지도 콘텐츠와 선택·검색·정렬 상태는 pages/map이 소유하며 HDS에 도메인 로직을 넣지 않는다. 실제 지도 SDK와 서버 연동은 이번 범위에서 제외한다.

**Tech Stack:** React, TypeScript, Tailwind CSS, HDS, Vitest, Testing Library, pnpm.

**Spec:** Figma https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-32364 및 아래 화면 계약. 구현 시작 시 `apps/client/src/pages/map/MapPage.spec.md`에 화면 계약을 옮긴다.

## 스택 기준

- 부모: `feat/HASHI-214-drag-panel`, 확인한 커밋 `22b3fc44fd9caebcb8ce9ecc8ea37bdd145d846e`.
- 작업: `feat/HASHI-215-map-publishing`.
- 지도 PR base는 부모 브랜치. 부모 PR은 #209이며 develop 대상이다.
- 부모의 후속 변경은 검토 후 지도 브랜치에 반영한다. 부모 브랜치를 직접 수정하거나 push하지 않는다.
- 부모 머지 후 지도 커밋만 develop 위로 옮긴다. 특히 squash merge 시 기록한 부모 경계를 기준으로 rebase --onto하고 PR base를 develop으로 변경한다. 재작성 전 백업 및 diff 검증을 수행한다.
- 실제 지도 구현 커밋이 생긴 뒤 PR을 만든다. 이 문서만으로 기능 구현 완료 PR을 만들지 않는다.

## Global Constraints / 화면 계약

- `/map`은 기존 public route와 하단 내비게이션을 유지한다.
- 기준 화면: 393×852. OS 상태 표시줄은 앱 콘텐츠로 구현하지 않는다. 작은 화면과 safe-area, 키보드에 맞춰 가용 높이를 계산한다.
- 정적 지도 미리보기와 샘플 식당을 사용한다. 실제 위치·검색·예약·저장 성공으로 오인시키는 처리는 하지 않는다. 서버 요청과 새 지도 의존성은 추가하지 않는다.
- 첫 화면, 목록 확장, 확대 마커 미리보기, 음식 필터, 필터 목록 확장, 식당 선택, 상세 확장, 상세 스크롤, 사진 보기, 정렬, 긴 제목의 11개 디자인 상태를 확인한다.
- DragPanel은 `height`, `normalHeight`, `maxHeight`, `onHeightChange`, `header`, `footer`를 사용한다. 접힘은 30px이고 실제 일반/최대 높이는 해당 Figma 자식 노드를 측정해 화면 spec에 기록한다. Storybook 예시 높이를 그대로 채택하지 않는다.
- 손잡이 드래그와 본문 스크롤은 분리한다. 목록 자체를 드래그해 패널이 확장되는 동작은 현재 공통 컴포넌트 계약에 없다.
- 기존 HDS 검색 필드·칩·버튼·썸네일·탭 및 적합한 식당 표시 컴포넌트를 우선 재사용한다. 지도 전용 UI는 page-local로 둔다.
- 검색은 샘플 이름/메뉴 기준, 음식 필터는 단일 선택, 정렬은 추천순/별점순/리뷰순의 샘플 정렬로 제한한다. 선택 변경 시 목록 스크롤 초기화 정책을 명세한다.
- 사진 모달을 닫으면 원래 선택 식당으로 돌아간다. 상세를 닫으면 기존 필터와 목록으로 돌아간다. 저장/예약은 준비 중 안내를 제공하고 성공 상태를 만들지 않는다.

## Review Focus

1. 320px 및 키보드 노출 시 패널과 하단 내비게이션 겹침: Task 2 브라우저 검증.
2. 패널 접기/펼치기와 목록 교체의 스크롤 복원 구분: Task 3 통합 검증.
3. 빈 검색 결과·필터 변경 후 잘못된 선택 식당 잔존: Task 3 상태 테스트.
4. 긴 제목·이미지 로딩 실패·사진 닫기 후 포커스: Task 4 테스트 및 시각 확인.
5. 패널 본문 스크롤과 상세 sticky header의 소유권: Task 1 기술 확인, Task 4 실제 스크롤 검증.

## Task 1: 공통 패널 조합 및 상세 스크롤 구조 확정

**Files:** `packages/hds-ui/src/components/dragPanel/DragPanel.tsx` (참조), `apps/client/src/features/restaurantDetail/components/RestaurantDetailTemplate.tsx` (참조), 새 `apps/client/src/pages/map/MapPage.spec.md`.

- [ ] 지정 Figma의 자식 프레임 context/screenshot을 읽고 일반/최대 패널 높이와 상세 고정 영역을 기록한다.
- [ ] 기존 상세 템플릿의 window scroll/API 의존성을 확인하고 표현 전용 조각만 재사용한다.
- [ ] DragPanel의 header slot과 콘텐츠 내부 sentinel의 IntersectionObserver로 상세 제목/탭 고정 전환이 가능한지 확인한다. 내부 DOM selector 조회나 중첩 스크롤로 우회하지 않는다.
- [ ] 현재 API로 불가능하면 필요한 일반 목적 scroll ref/callback 제안을 부모 담당자와 먼저 합의한다. 부모 수정이 필요할 경우 의존성으로 기록하고 독립 작업부터 진행한다.
- [ ] 화면 spec에 확정된 전환·샘플 한계·접근성·높이 계약을 기록한다.

## Task 2: 지도 기본 화면과 DragPanel 배치

**Files:** 새 `pages/map/MapPage.tsx`, `pages/map/index.ts`, `pages/map/components/MapViewportPreview.tsx`, `pages/map/MapPage.test.tsx`; 수정 `app/router/lazy.ts`, `app/router/routes.ts`, `app/router/routes.test.tsx` (모두 apps/client/src 아래).

**Interfaces:** MapViewportPreview는 선택된 식당 id와 `onSelectRestaurant(id: string): void`, `onSelectArea(code: string): void`를 받는다. 지리 좌표 조회가 아닌 샘플 선택 인터페이스다.

- [ ] /map에서 준비 중 화면 대신 지도 미리보기와 이름 있는 패널을 표시하는 실패 테스트를 추가한다.
- [ ] `pnpm --filter @hashi/client exec vitest run src/pages/map/MapPage.test.tsx src/app/router/routes.test.tsx`로 실패 확인 후 route와 최소 화면을 구현한다.
- [ ] Figma 원본 배경 asset과 필요한 마커 asset만 로컬에 보관한다. 전체 화면 스크린샷을 UI 구현으로 사용하지 않는다.
- [ ] 내비게이션을 제외한 relative 영역에 DragPanel을 배치한다. 포인터/키보드 패널 조작과 배경 클릭을 확인한다.
- [ ] 같은 테스트 PASS 및 320/393/768px·키보드 노출 검증 후 작업 단위 커밋.

## Task 3: 샘플 목록·검색·필터·정렬 연결

**Files:** 새 `pages/map/data/mapPreviewRestaurants.ts`, `pages/map/types.ts`, `pages/map/hooks/useMapPreviewState.ts`, `pages/map/utils/filterMapRestaurants.ts`, 대응 utils 테스트; `pages/map/components/MapRestaurantList.tsx`, `MapRestaurantCard.tsx`, `MapToolbar.tsx`.

**Interfaces:** MapRestaurant는 id/name/areaCode/category/rating/reviewCount/recommendationRank/menuKeywords/images/hours/price/description/address를 가진다. `filterMapRestaurants(restaurants, { keyword, category, areaCode, sort })`는 입력을 수정하지 않는 배열 변환이다. sort는 recommended/rating/reviews다.

- [ ] 검색·음식/지역 필터의 교집합, 빈 결과, 동점의 안정 정렬을 pure helper 실패 테스트로 고정한다.
- [ ] helper와 샘플 데이터를 구현하고 해당 테스트 PASS를 확인한다.
- [ ] 페이지 통합 테스트에 필터 선택/해제, 정렬, 빈 결과, 선택 식당 닫기 시 필터 유지, 목록 교체 시 선택 해제를 추가한다.
- [ ] HDS 기반 toolbar/card/list를 조립한다. 같은 목록 접기/펼치기는 패널을 재마운트하지 않으며 목록 조건이 바뀔 때만 스크롤을 초기화한다.
- [ ] `pnpm --filter @hashi/client exec vitest run src/pages/map` PASS 후 작업 단위 커밋.

## Task 4: 식당 상세·사진 보기

**Files:** 새 `pages/map/components/MapRestaurantDetail.tsx`, `MapPhotoViewer.tsx`; 수정 `MapPage.tsx`, `MapPage.test.tsx`.

**Interfaces:** 상세는 `restaurant: MapRestaurant`, `onClose(): void`, `onPhotoSelect(index: number): void`를 받는다. 사진 뷰어는 images/initialIndex/onClose를 받는다.

- [ ] 마커/카드 선택 → 상세 → 닫기, 사진 열기/닫기 및 초점 복귀, 미연동 저장/예약 안내 테스트를 먼저 추가한다.
- [ ] Task 1에서 확정한 단일 스크롤 구조로 제목·탭·본문·하단 액션을 구성한다. 상세 API hook은 호출하지 않는다.
- [ ] 메뉴/사진/리뷰는 샘플 상태로 명시하고 탭을 무반응 버튼으로 남기지 않는다. 디자인이 없는 콘텐츠는 기존 상세 표시 규칙을 사용하고 별도 제품 정책을 발명하지 않는다.
- [ ] 긴 제목 말줄임, 이미지 실패 fallback, 확대 후 선택 해제, 목록 복귀 동작을 검증한다.
- [ ] 페이지 테스트 PASS 후 작업 단위 커밋.

## Task 5: 회귀·시각 QA와 스택 PR

**Files:** `MapPage.spec.md`, `docs/architecture/routing-and-access-policy.md`, 필요한 기존 route 테스트.

- [ ] 변경된 /map 정책과 샘플 퍼블리싱 한계를 문서에 반영한다.
- [ ] `pnpm --filter @hashi/client lint`, `pnpm --filter @hashi/client typecheck`, `pnpm --filter @hashi/client test`, `pnpm --filter @hashi/client build` 실행.
- [ ] `pnpm --filter @hashi/hds-ui exec vitest run src/components/dragPanel/DragPanel.test.tsx`로 부모 컴포넌트 회귀 확인.
- [ ] 브라우저에서 11개 디자인 상태, 터치 손잡이, 내부 스크롤, 하단 내비게이션, 키보드 접근성 확인. 실제 지도 pan/zoom 검증으로 보고하지 않는다.
- [ ] `git diff --check` 및 부모 대비 diff 확인. 검증 실패가 부모 기인이라면 별도로 기록한다.
- [ ] 지도 구현 커밋을 push하고 base `feat/HASHI-214-drag-panel`인 PR을 생성한다. 부모 #209 링크와 순차 머지 조건, SDK/API 제외 범위를 PR에 명시한다.

## 현재 상태

화면 구현과 회귀 검증 완료. 최종 QA 결과는 `docs/qa/HASHI-215/README.md`를 참고한다.

### 구현 중 확정한 조정

- 제목/탭 고정은 단일 DragPanel 스크롤 안의 CSS sticky로 구현했다. IntersectionObserver 또는 부모 HDS API 수정이 필요하지 않았다.
- 일반 목록/요약은 비모달이고, 전체 상세·사진 보기는 HDS Dialog를 조합해 배경 접근과 초점을 관리한다.
- Task 2~4의 브라우저 검증과 구현 커밋은 조합된 화면을 기준으로 Task 5에서 통합했다.
- 저장 수·사진/리뷰 수는 모두 샘플 데이터이며 실제 API 결과로 취급하지 않는다.
