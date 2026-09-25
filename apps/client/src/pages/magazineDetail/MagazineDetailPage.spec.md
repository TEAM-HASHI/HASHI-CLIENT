# 매거진 상세 페이지

## 작업 범위

- 경로: `/magazines/:magazineId`
- Figma: `8317:36532`
- 기획 명세: `HASHI-PLAN/02_PRODUCT_SPEC/MAGAZINE/MAGAZINE_DETAIL/MAGAZINE_DETAIL.md`
- 이번 작업에서는 매거진 상세 퍼블리싱과 매거진 목록에서 상세로 이동하는 내부 경로를 구현한다.
- 클라이언트 OpenAPI에 필요한 API가 아직 없으므로 상세 조회, 좋아요 요청, 로그인 유도는 후속 작업으로 남긴다.

## 동작

- 상단 헤더는 고정하고 본문은 헤더 높이 `75px` 아래에서 시작한다.
- 뒤로가기는 브라우저 방문 기록이 있으면 이전 화면으로 이동한다. 브라우저 뒤로가기인 `POP` 이동에서는 전역 스크롤 초기화를 생략해 매거진 목록의 스크롤 복원을 방해하지 않는다.
- 직접 URL로 진입해 이전 방문 기록이 없으면 `/magazines`로 이동한다.
- 목록의 배너와 카드는 `location.state`로 제목과 대표 이미지를 전달할 수 있다. 값이 없거나 올바르지 않으면 안전한 기본값을 사용한다.
- 커버 이미지는 HDS `Carousel`을 사용해 가로로 전환하고 현재 이미지 번호와 전체 이미지 수를 표시한다.
- 커버 이미지가 없거나 로딩에 실패하면 `ImageFallback`을 표시한다.
- 좋아요는 퍼블리싱 단계에서 현재 `magazineId`에 한정된 로컬 상태만 변경한다.
- 식당 카드는 데이터로 전달받은 이미지 항목만 렌더링하며, 이미지 배열이 비어 있으면 임의의 이미지 슬롯을 만들지 않는다.
- 식당 카드를 선택하면 `getRestaurantDetailPath`로 생성한 `/restaurants/:restaurantId` 경로로 이동한다.
- 연결된 식당이 없으면 식당 목록 영역을 렌더링하지 않는다.

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
- `GET /api/v1/magazines/{magazineId}`가 제공되면 임시 preview factory를 페이지 전용 query와 응답-to-view model 매핑으로 교체한다.
- `magazineId`는 현재 로컬 좋아요 상태의 식별자이며, API 연동 후에는 상세 query key의 식별자가 되어야 한다.
- `location.state`는 목록에서 전달하는 선택적 미리보기 값으로만 사용하고 상세 데이터의 식별자로 사용하지 않는다.
- 로컬 좋아요 토글은 인증 상태를 확인하는 낙관적 좋아요 등록·취소 mutation으로 교체하고 실패하면 이전 상태로 되돌린다.

## 기획 명세와의 차이

- 기획 명세에는 작성자명이 포함되어 있지만 현재 Figma에는 작성자 영역이 없다. 이번 구현은 현재 Figma를 따르며, 상세 API 연동 전에 작성자 노출 여부를 확정해야 한다.
- 상세 조회 실패, 삭제된 매거진, 비로그인 좋아요 처리는 API 및 인증 연동과 함께 구현한다.

## 검증

- [x] 목록 배너와 카드가 `/magazines/:magazineId` 내부 경로로 이동한다.
- [x] `location.state` 없이 직접 진입해도 렌더링 오류가 발생하지 않는다.
- [x] 잘못된 `location.state` 값은 안전한 기본값으로 처리한다.
- [x] 다른 `magazineId`로 변경되면 로컬 좋아요 상태가 초기화된다.
- [x] 이미지 주소가 변경되었다가 이전 주소로 돌아오면 실패한 이미지를 다시 요청한다.
- [x] 목록에서 전달한 대표 이미지 외에 확인용 이미지를 추가하지 않는다.
- [x] 이미지가 없는 식당에 임의의 fallback 슬롯을 만들지 않는다.
- [x] 브라우저 뒤로가기에서는 전역 스크롤 초기화를 실행하지 않는다.
- [ ] 상세 API와 좋아요 API 연동 후 조회·오류·인증 상태를 검증한다.
- [ ] 320px, 393px, 430px 화면에서 가로 overflow와 실제 swipe 동작을 수동 확인한다.
