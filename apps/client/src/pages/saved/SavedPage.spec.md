# 저장 컬렉션 PR 1

## 목적과 범위

`/saved`의 인증된 사용자에게 컬렉션 목록·상세를 표시하는 퍼블리싱이다.
별도 목 데이터로 동작하며 API와 영구 저장을 연결하지 않는다.

기능 근거는 최신화한 HASHI-PLAN `main` (`6f2c99c`)의
SAVED_COLLECTION_LIST, SAVED_COLLECTION_SAVE, SAVED_COLLECTION_MANAGE,
SAVED_COLLECTION, SAVED_COLLECTION_SHARE 명세다. 충돌 시 사용자 확정 정책을 우선한다.

작업 브랜치는 `feat/HASHI-206-collection-list`이며, 미병합 #209의 head
`22b3fc4`에서 분기했다. PR base는 `feat/HASHI-214-drag-panel`로 지정한다.
기존 `feat/HASHI-206-collection-page` 브랜치는 보존했다.

## 데이터와 상태

- `collectionMocks.ts`: 컬렉션, 식당, 저장 시각, 세 커버 이미지 슬롯을 명시한다.
- `selectCollections`: 최근 생성 순으로 고정한다. 화면에는 최신순만 표시한다.
- `selectRestaurants`: 삭제·비노출·누락 식당을 제외한 후 분류와 정렬을 적용한다.
- 정렬은 최신순/별점순/리뷰순, 분류는 전체/음식점/카페/주점이다.
- 상세 기본값은 최신순/전체이며, 정렬과 분류는 서로 유지된다. 선택 즉시 적용하고
  메뉴를 닫으며 키보드 선택·Escape·바깥 클릭 닫기·포커스 복귀를 지원한다.
- 목록·상세는 같은 `/saved` 안에서 전환한다. 새로고침 시 목 데이터는 초기값이다.
- 빈 목록은 0개와 생성 항목을, 빈 상세는 컬렉션 정보와 0곳을 유지한다.
- 긴 이름은 행에서 줄바꿈하며 HDS Header 제목은 말줄임과 원문 title을 제공한다.

## 지도 담당자 연결

`지도로 보기`는 기존 `/map`에 `CollectionMapState`를 location.state로 전달한다.
필드는 `{ collectionId, sort, category }`이며 `isCollectionMapState`로 검증한다.
지도 모드에서는 `BottomNavigationLayout`이 저장 탭을 활성화한다.
현재 base의 지도 경로는 ComingSoon 상태이며 이 PR에서 교체하지 않는다.

`CollectionDragPanelContent`는 내비게이션과 safe area를 제외한 relative 부모
컨테이너에 배치한다. `availableHeight`는 그 부모의 실측 높이다. `data`, `view`,
`onViewChange`, `onRestaurantSelect`, `onClose`를 지도 담당자가 연결한다.
`onClose`는 컬렉션 모드를 해제하고 기본 지도를 복원할 지점이다.
목 식당 ID를 실제 식당 상세 API에 전달하지 않는다.

손잡이를 포함한 최초 높이는 목록 234px, 상세 393px이다. 최대 높이는 가용 높이
에서 12px을 뺀 값이며 작은 화면에서 제한한다. 패널을 접어도 선택과 정렬·분류를
유지한다. PR 1에는 고정 하단 액션이 없어 footer를 사용하지 않는다. 긴 설명과
낮은 화면에서도 모든 정보에 접근하도록 요약·필터·목록을 같은 body 스크롤에
배치한다. 드롭다운은 portal로 패널 바깥 잘림을 방지한다.

## 재사용과 후속 PR

HDS Header, BottomNavigation, Thumbnail/ImageFallback, Button, IconButton,
OptionItem, DragPanel과 기존 아이콘을 사용하며 공통 패키지는 수정하지 않는다.
커버 색상 중 기존 토큰에 없는 값은 Figma `collection_cover`의 확인된 색상을
이름 있는 페이지 상수로 관리한다. 예시 사진은 없으므로 HDS fallback을 사용한다.

더보기 아이콘은 장식용 슬롯으로만 배치한다. 새 컬렉션 만들기는 PR 2까지
비활성화한다. PR 2는 생성·수정하기·편집하기·저장 UI를, PR 3은 선택·이동·삭제·
링크 복사·헤더 공유·확인 모달·토스트를 연결한다. 공개 링크 조회는 제외한다.
비공개 공유는 즉시 복사 명세보다 사용자 확정 정책을 우선하여 공개 전환 확인
모달을 거친다. 실제 공유 URL 생성·복사는 연결하지 않는다.

## 디자인 근거와 정책 차이

목록 8317:37705, 상세 8317:38007, 정렬 8317:38586, 분류 8317:38697,
패널 8317:40088을 주 참조로 사용한다. Figma 파일은 `UHaom01PvoRx2wRCYa1kS1`이다.
추가로 개별 확인한 프레임은 8317:37451, 8317:37386, 8317:38086,
8317:39104, 8317:39211, 8317:40193이다.
목록 정렬 화살표는 사용자 확정에 따라 제외한다. Figma의 지도 활성 탭과 달리
저장 탭을 활성화한다. X는 SAVED_COLLECTION_LIST의 상세 복귀 문구보다
사용자 확정 및 SAVED_COLLECTION의 기본 지도 복귀 정책을 우선한다.

## 추가 Figma 대조 (2026-10-07)

- `7803:48115`, `7847:73468`, `7807:27408`, `7847:71191`의 상세 속성과
  스크린샷을 각각 조회했다. 일반 저장 목록과 지도 목록은 서로 다른 레이아웃이다.
- 지도 목록은 50px 커버(24px 셀, 2px 간격), 좌우 20px, 행 세로 여백 18px,
  커버와 이름 간격 12px을 적용한다. 일반 목록의 100px 커버는 유지한다.
- 지도 목록 제목은 `컬렉션 N개`로 변경한다. 최신순 표시는 확정 정책에 따라 유지하며,
  공개 여부는 일반 목록에서만 표시한다. 일반 상세의 부제는 `저장한 장소`다.
- 24px 셀의 HDS fallback 로고 잘림을 막기 위해 사용자 승인에 따라 48px Thumbnail을
  페이지 커버 내부에서 절반 크기로 축소한다. 공통 컴포넌트는 수정하지 않는다.
- 지도 목록의 `location.state`는 `{ collectionId: null, sort, category }`를 사용한다.
  `isCollectionViewState`는 목록·상세를, `isCollectionMapState`는 상세 전달만 검증한다.
  fixture 종료 시 state를 null로 해제하여 기본 지도 탭으로 복귀한다.
- 새 패널 두 프레임은 458px 영역에 84px 내비게이션이 겹친다. 가시 패널 높이
  374px로 통일할지는 사용자 답변 대기 중이며 기존 234px/393px을 유지한다.
- Figma의 지도·검색·핀·네이티브 상태표시줄은 구현 범위가 아니며 추가하지 않는다.
  목 이미지의 HDS fallback과 실제 데이터 기반 개수는 디자인 예시와 다를 수 있다.

## 검증 명령

- 단위·컴포넌트: `pnpm --filter @hashi/client test src/pages/saved`
- 브라우저: client에서 `pnpm exec playwright test --config e2e/saved.config.ts`
- 로컬 Chrome 사용 시 앞에 `PLAYWRIGHT_CHANNEL=chrome`을 지정한다.
- 테스트 fixture: `/e2e/fixtures/saved.html`; 제품 라우터에는 등록하지 않는다.
- fixture 전용 쿼리: `scenario=empty`, `scenario=long`, `panel=list`, `panel=detail`.
- 393x852, 320x568, 320x400, 1440x900에서 스크린샷·overflow·스크롤을 확인한다.

## 검증 결과

2026-10-07 구현 시 확인한 결과다.

- client 전체 테스트: 146개 파일, 720개 테스트 통과.
- 최종 PR 1 테스트: 3개 파일, 12개 테스트 통과.
- client `typecheck` 및 e2e `tsconfig.json` 타입 검사 통과.
- 변경 파일의 Prettier 검사와 `git diff --check` 통과.
- 최초 구현 Chrome Playwright: 6개 테스트 통과. 추가 Figma 대조 후에는 지도 목록의
  50px 커버, 저장 탭, 종료 후 지도 탭 복귀를 포함해 7개 테스트로 확장했다.
- 393x852, 320x568, 320x400, 1440x900에서 목록·상세·빈 목록·긴 이름·긴 목록,
  드롭다운·패널 드래그·접힘 유지·종료 콜백·내비게이션 간격을 검증했다.
- 스크린샷은 Git에서 제외되는 `apps/client/test-results/saved/`에 저장한다.
- `lint`는 기존 `node_modules` 파일 읽기에서 장시간 대기하여 종료했다.
  제한 밖 재실행에서도 끝나지 않아 통과로 기록하지 않는다.
- `build`는 TypeScript와 Vite의 2,198개 모듈 변환·앱 번들 출력까지 성공했으나,
  PWA 후처리에 필요한 기존 의존성 읽기에서 대기했다. 서비스 워커 생성과
  전체 명령의 정상 종료는 확인하지 못했다. 재실행도 같은 대기로 종료했다.
- 의존성·잠금 파일이나 공통 패키지를 변경해 검사를 우회하지 않았다.
- 실제 지도 복원·식당 상세·API 연결은 지도 담당자의 후속 작업이며 미검증이다.
