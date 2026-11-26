# 저장 컬렉션 화면

컬렉션과 저장한 식당을 조회하고 관리한다. API 요청·인증·캐시·폼 검증은 [컬렉션 API 명세](./CollectionApi.spec.md)를 따른다.

## 라우트와 화면 책임

| 경로                                                              | 접근                           | 화면                                         |
| ----------------------------------------------------------------- | ------------------------------ | -------------------------------------------- |
| `/saved`, `/mypage/saved`                                         | 로그인                         | `SavedApiPage`의 내 컬렉션 목록              |
| `/saved/collections/:collectionId`                                | 공개 상세는 비로그인 접근 가능 | `SavedApiPage`의 컬렉션 상세                 |
| `/mypage/saved/:collectionId`                                     | 로그인                         | 마이에서 진입한 컬렉션 상세                  |
| `/saved/collections/new`, `/saved/collections/:collectionId/edit` | 로그인                         | `CollectionFormQueryPage`의 생성·수정        |
| `/saved/collections/:collectionId/restaurants/edit`               | 로그인                         | `CollectionEditorQueryPage`의 저장 식당 편집 |

- 목록·상세는 하단 내비게이션을 유지한다. 생성·수정·편집은 독립 화면으로 열고, 저장 대상 선택·이동·삭제·수정 폐기·공개 전환 확인은 모달로 연다.
- `SavedApiPage`는 관리 액션과 모달, `SavedQueryPage`는 조회 상태·목록·상세 렌더링, `SavedPageLayout`은 고정 영역과 내부 스크롤을 담당한다. 공용 커버와 대상 선택창은 `features/collection`에서 가져온다.
- 수정 중 변경한 값이 있는 상태에서 뒤로가면 폐기 여부를 확인한다. 계속하기는 입력을 보존한다. 폼 완료·취소는 기록된 진입 위치로 돌아가며, 직접 진입 시 목록으로 돌아간다.

## 목록과 상세

- 목록은 컬렉션 개수·생성 액션을 고정하고 행만 스크롤한다. 목록 자체에는 정렬 메뉴를 두지 않는다. 일반 목록의 컬렉션 커버·상세 식당 이미지는 100px이고, 지도 컬렉션 목록 커버는 50px이다. 사진이 비어 있으면 HDS 이미지 fallback을 사용한다.
- 상세는 컬렉션 이름·설명·개수·필터를 목록 위에 표시한다. 설명은 화면 너비에 따라 전체를 줄바꿈해 표시하고, 기존 개행은 공백으로 바꾼다. 설명이 비어 있으면 영역을 생략한다. 조회가 성공한 빈 상세는 개수를 0으로 표시한다.
- 상세 기본값은 최신순·전체다. 정렬은 최신순·별점순·리뷰순, 분류는 전체·음식점·카페·주점이다. 두 값은 `sort`·`category` query에 기록하고 서로 유지한다. 정렬·분류 메뉴는 텍스트와 화살표를 하나의 버튼으로 묶고, 방향키·선택·Escape·바깥 클릭과 포커스 복귀를 지원한다.
- 최초 목록·필터 조회 중에는 실제 행 크기의 스켈레톤 3개를, 다음 페이지 조회 중에는 기존 목록 뒤에 1개를 표시한다. 스켈레톤은 `secondary-200`을 사용하고 모션 감소 설정을 따른다. 초기 오류와 기존 행을 보존하는 추가 페이지 오류는 각각 재시도할 수 있다.
- 일반 목록 더보기는 `수정하기 → 공유하기 → 삭제하기`, 소유자 상세 더보기는 `편집하기 → 공유하기 → 삭제하기` 순서다. 식당 행 선택은 실제 식당 ID로 상세를 연다. 돌아오면 같은 방문 이력의 정렬·분류·내부 스크롤을 복원한다.
- 편집 화면은 헤더·전체 선택·하단 액션을 고정하고 식당 목록만 스크롤한다. 현재까지 불러온 식당만 전체 선택에 포함한다. 추가 페이지의 식당은 직접 선택하거나 전체 선택을 다시 눌러 포함한다.

## 지도 연결

- 지도 북마크 FAB는 로그인한 사용자에게 비모달 컬렉션 목록 패널을 열고 지도와 지도 탭을 유지한다. FAB 재클릭이나 목록 패널의 Escape로 닫는다. 목록에서 컬렉션을 선택하면 같은 `/map`의 상세 패널로 전환하고, 상세를 닫으면 컬렉션 목록 패널로 돌아간다.
- 일반 상세의 `지도로 보기`도 `/map`으로 이동한다. `CollectionMapState`로 컬렉션 ID·정렬·분류와 필요한 진입 위치를 전달하며, 닫으면 정렬·분류를 보존해 진입 상세로 돌아간다.
- 지도 상세 패널은 `CollectionPanelHeader`로 왼쪽 정렬 제목·설명·필터별 수·필터와 소유자 액션을 표시한다. 지도 패널의 공유 아이콘은 독립 액션이다. 핀·좌표 정책은 [컬렉션 API 명세의 지도 계약](./CollectionApi.spec.md#지도-계약)을 따른다.
- 지도 목록·상세 패널의 높이는 공통 DragPanel 단계와 지도 화면의 가용 높이에 맞춘다. 생성·수정 화면에서 돌아오면 원래 지도와 컬렉션 패널을 복원한다. 지도 자체의 화면 구성은 [지도 화면 명세](../map/MapPage.spec.md)를 따른다.

## 디자인

- [저장 목록](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-37705), [일반 상세](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=10043-181196), [지도 북마크 목록](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-39104), [지도 상세 헤더](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=9171-73947)
- [컬렉션 커버](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-38262), [생성](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=9996-80308), [수정](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=9996-80543), [저장 대상 선택](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-38885)
- [식당 편집](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-39425), [이동 대상 선택](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-39703), [식당 삭제 확인](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=10043-179982), [공개 전환 확인](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=10043-180824)
