# 매거진 상세 페이지

## 작업 범위

- 경로: `/magazines/:magazineId`
- Figma: `8317:36532`
- 기획 명세: `HASHI-PLAN/02_PRODUCT_SPEC/MAGAZINE/MAGAZINE_DETAIL/MAGAZINE_DETAIL.md`
- 이번 작업에서는 매거진 상세 퍼블리싱과 매거진 목록에서 상세로 이동하는 내부 경로를 구현한다.
- 상세 조회와 좋아요 API는 클라이언트에 아직 연동하지 않았다. 서버 코드의 API 존재 여부와 실제 배포·응답 계약은 별도로 확인한다.
- 임시 상세 데이터는 개발 환경에서만 사용한다. 운영 빌드의 상세 경로는 API 연동 전까지 준비 중 화면을 표시한다.

## 동작

- 상단 헤더는 고정하고 본문은 헤더 높이 `75px` 아래에서 시작한다.
- 뒤로가기는 브라우저 방문 기록이 있으면 이전 화면으로 이동한다. 브라우저 뒤로가기인 `POP` 이동에서는 기존 전역 스크롤 초기화를 생략하는 매거진 목록 예외를 유지한다. 캐시 만료 후 목록 재조회와 위치 복원은 목록 브랜치 및 공통 복원 정책과 통합할 후속 작업이다.
- 직접 URL로 진입해 이전 방문 기록이 없으면 `/magazines`로 이동한다.
- 목록의 배너와 카드는 `location.state`로 제목과 대표 이미지를 전달할 수 있다. 값이 없거나 올바르지 않으면 안전한 기본값을 사용한다.
- 커버 이미지는 HDS `Carousel`을 사용해 가로로 전환하고 현재 이미지 번호와 전체 이미지 수를 표시한다.
- 커버 이미지가 없거나 로딩에 실패하면 `ImageFallback`을 표시한다.
- 로그인한 사용자의 좋아요는 개발 미리보기에서 현재 `magazineId`에 한정된 로컬 상태만 변경한다. 비로그인 사용자는 상태를 변경하지 않고 로그인 바텀시트를 표시하며 로그인 후 돌아올 상세 경로를 전달한다.
- 식당 카드는 데이터로 전달받은 이미지 항목만 렌더링하며, 이미지 배열이 비어 있으면 임의의 이미지 슬롯을 만들지 않는다.
- 식당 카드를 선택하면 `getRestaurantDetailPath`로 생성한 `/restaurants/:restaurantId` 경로로 이동한다.
- 연결된 식당이 없으면 식당 목록 영역을 렌더링하지 않는다.
- 식당 목록은 제목 아래 `16px`에서 시작한다. 카드 최소 높이는 `268px`이며 제목·평점 사이 `3px`, 요약·이미지 사이 `8px`, 이미지·정보 사이 `12px`, 정보 행 사이 `2px`을 사용한다. 좁은 화면에서 내용이 늘어나면 카드도 확장된다.

## UI 구조

```text
MagazineDetailPage
  Header
  MagazineArticle
    MagazineCoverCarousel
    MagazineLikeButton
    본문, 해시태그, 작성 시각
  MagazineRestaurantSection
    MagazineRestaurantCard
```

## 컴포넌트 매핑

- HDS: `Header`, `IconButton`, `Carousel`, `ImageFallback`
- HDS 아이콘: `BackIcon`, `HeartBlankIcon`, `HeartFillIcon`, `CalendarIcon`, `StarFillIcon`, `ClockSmallIcon`, `MoneySmallIcon`
- 페이지 전용 컴포넌트는 매거진 상세 조합만 담당하며 다른 경로로 공개하지 않는다.

## 데이터 경계

- `createMagazineDetailPreview`는 목록에서 전달된 미리보기 값과 상세 API 연동 전 임시 퍼블리싱 데이터를 페이지 조립 코드에서 분리한다.
- 상세 API 연동 시 임시 preview factory와 운영 준비 중 분기를 페이지 전용 query 및 응답-to-view model 매핑으로 교체한다.
- 상세 미리보기는 `magazineId`를 React key로 사용한다. 매거진이 바뀌면 좋아요·로그인 안내·캐러셀 상태가 함께 초기화되며, 하위 컴포넌트에 초기화용 ID를 따로 전달하지 않는다. API 연동 후에는 상세 query key에도 `magazineId`를 사용한다.
- `location.state`는 목록에서 전달하는 선택적 미리보기 값으로만 사용하고 상세 데이터의 식별자로 사용하지 않는다.
- 로컬 좋아요 토글은 인증 상태를 확인하는 낙관적 좋아요 등록·취소 mutation으로 교체하고 실패하면 이전 상태로 되돌린다.

## 기획 명세와의 차이

- 기획 명세에는 작성자명이 포함되어 있지만 현재 Figma에는 작성자 영역이 없다. 이번 구현은 현재 Figma를 따르며, 상세 API 연동 전에 작성자 노출 여부를 확정해야 한다.
- 상세 조회 실패, 삭제된 매거진, 좋아요 요청 실패 시 롤백은 API 연동과 함께 구현한다.

## 검증

- [x] 목록 배너와 카드가 `/magazines/:magazineId` 내부 경로로 이동한다.
- [x] `location.state` 없이 직접 진입해도 렌더링 오류가 발생하지 않는다.
- [x] 잘못된 `location.state` 값은 안전한 기본값으로 처리한다.
- [x] 다른 `magazineId`로 변경되면 로컬 좋아요 상태가 초기화된다.
- [x] 이미지 주소가 변경되었다가 이전 주소로 돌아오면 실패한 이미지를 다시 요청한다.
- [x] 목록에서 전달한 대표 이미지 외에 확인용 이미지를 추가하지 않는다.
- [x] 이미지가 없는 식당에 임의의 fallback 슬롯을 만들지 않는다.
- [x] 비로그인 좋아요는 상태를 변경하지 않고 로그인 안내를 표시한다.
- [ ] 목록 브랜치 병합 후 캐시 만료 시 목록 재조회·위치 복원 정책을 통합한다.
- [ ] 상세 API와 좋아요 API 연동 후 조회·오류·인증 상태를 검증한다.
- [ ] 320px, 393px, 430px 화면에서 가로 overflow와 실제 swipe 동작을 수동 확인한다.
