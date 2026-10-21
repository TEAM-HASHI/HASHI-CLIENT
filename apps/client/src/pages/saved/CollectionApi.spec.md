# 컬렉션 API 연동 (HASHI-224)

## 범위와 PR 구조

- 기반은 #226 `chore/HASHI-229-api-type`과 컬렉션 UI가 병합된 최신 `develop`이다.
- 조회 3개 → 생성·수정 2개 → 식당 관리·컬렉션 삭제 4개의 순서로 PR을 쌓는다.
- 각 PR의 base는 직전 브랜치다. #226 병합 후 첫 PR의 base와 diff를 `develop` 기준으로 정리한다.

| PR                    | 브랜치                                     | base                                 |
| --------------------- | ------------------------------------------ | ------------------------------------ |
| 조회                  | `feat/HASHI-224-collection-read-api`       | `chore/HASHI-229-api-type`           |
| 생성·수정             | `feat/HASHI-224-collection-form-api`       | `feat/HASHI-224-collection-read-api` |
| 식당 관리·컬렉션 삭제 | `feat/HASHI-224-collection-management-api` | `feat/HASHI-224-collection-form-api` |

현재 로컬 조회 브랜치만 생성되어 있다. 후속 브랜치는 앞 단계의 승인된 커밋을 기준으로 생성하며,
각 PR 범위에 속하는 파일만 커밋한다. 원래 작업 공간의 기존 API 브랜치와 파일은 보존한다.

- 식당 상세 저장 버튼, 지도 핀 및 식당별 저장 여부·저장 수 API 연결은 제외한다.
- 커밋·푸시·실서버 데이터 변경은 사용자 승인 전 실행하지 않는다.

## 근거

- 2026-10-20에 받은 user OpenAPI와 서버 `develop`의 컬렉션 controller·DTO·service를 대조했다.
- 서버 확인 기준: `91ee3b0d427c8078faf5460d678c3d843885d444`.
- 기획 확인 기준: HASHI-PLAN `a2990f8a5afcf3f90aee4ac712c0ffd1209767a3`의
  `SAVED_COLLECTION`, `SAVED_COLLECTION_LIST` 및 사용자 확정 사항.
- 생성 타입은 #226의 결과를 사용한다. 생성 파일을 수작업으로 고치거나 별도 schema로 덮어쓰지 않는다.

## Data Dependencies

### 조회 PR: 현재 구현 범위

| 데이터                | Endpoint                                             | 입력                                                 | 방식              |
| --------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ----------------- |
| 내 컬렉션·대상 목록   | `GET /api/v1/collections`                            | `restaurantId?`, 숫자 `cursor?`, `size?`             | infinite query    |
| 상세 헤더·수정 초기값 | `GET /api/v1/collections/{collectionId}`             | 양의 안전한 정수 ID                                  | conditional query |
| 저장 식당 목록        | `GET /api/v1/collections/{collectionId}/restaurants` | ID, `sort?`, `placeType?`, 문자열 `cursor?`, `size?` | infinite query    |

- endpoint는 기존 `shared/api/request`에 요청·인증·오류 처리를 위임하고 `AbortSignal`을 전달한다.
- 요청·응답 타입은 owning app의 generated OpenAPI에서 파생한다.
- query key는 `collectionQueryKeys`를 사용한다. cursor는 key가 아니라 `pageParam`으로 관리한다.
- UI의 `reviews`는 서버의 `review`, `all`은 `placeType` 생략으로 변환한다.
- 상세·식당 조회는 유효한 ID가 있을 때 실행한다. 내 목록은 소비자가 인증 준비 전 `params=null`을 전달한다.
- 비활성 인수로 수동 refetch해도 endpoint를 호출하지 않는다.
- `hasNext=false`면 추가 조회를 끝낸다. 누락된 페이지 정보·목록·잘못된 cursor는 빈 목록 성공으로 바꾸지 않는다.
- 실패를 local query state로 전달하며 query retry는 공통 정책을 따른다. 추가 페이지 실패 시 기존 페이지를 보존한다.
- `totalCount`와 `savedCount`는 서버 값을 보존한다. 표시 정책은 아래 보류 항목에 따른다.

### 화면 모델 경계

- summary에는 설명·생성일·전체 식당 관계가 없다. 기존 목 `SavedCollection`로 가장하지 않는다.
- ID를 검증해 화면용 문자열로 변환한다. 없는 ID·평점·지역·분류를 임의 생성하지 않는다.
- 공개 여부는 알려진 `visibility`만 변환한다. 알 수 없는 값은 공개나 비공개로 단정하지 않는다.
- `cover.imageUrls`는 기존 세 이미지 슬롯으로 변환한다. 빈 칸은 fallback용 `null`이다.
- `thumbnailUrl`과 `thumbnailImage`를 함께 보존한다. 최종 표시 시 공통 미디어 선택 계약을 적용한다.
- 목록 행은 표시용 필드만 받아 summary·식당 조회 모델을 직접 표시할 수 있다.
  누락된 평점·저장 수·공개 여부를 0이나 비공개로 대체하지 않으며, 알려지지 않은 커버 색상은 기존 이미지 fallback을 사용한다.
- 조회 기반의 구현과 제품 화면 연결은 구분한다. 현재 제품 화면의 데이터 원본과 지도용 public props는 변경하지 않는다.
- 계정별 cache 격리·이전 세션의 늦은 응답 차단 연결은 사용자 결정에 따라 보류한다.
  #221이 `develop`에 병합된 뒤 공통 인증 세션 기능을 재사용해 연결·검증한다.
  #221 브랜치를 미리 가져오거나 컬렉션 전용 인증 기능·빈 콜백을 중복 구현하지 않는다.
  이 후속 연결 전에는 계정 전환 대응까지 완료됐다고 표시하지 않는다.
- 실제 조회 데이터와 기존 목 mutation을 섞어 저장·이동·삭제가 성공한 것처럼 표시하지 않는다.

### 조회 화면 연결 상태

- `SavedQueryPage`는 조회 3개를 실제 query hook·화면 모델에 연결한다. 목 Provider를 사용하지 않는다.
- 기존 화면과 `SavedPageLayout`을 공유해 고정 헤더·내부 스크롤을 유지한다.
  추가 조회의 IntersectionObserver root도 이 내부 스크롤 영역이다.
- 초기 loading·오류 재시도·빈 목록과 추가 페이지 실패를 구분한다.
  추가 조회 실패 시 기존 항목을 유지하고 자동 추가 요청을 멈춘 뒤 같은 cursor로 재시도한다.
- 상세 직접 진입은 조회 중 목록으로 보내지 않는다. 정렬·분류는 URL에서 읽어 서버 query에 전달한다.
  식당 상세 이동은 실제 서버 ID를 사용하며, 복귀 시 Query의 추가 페이지와 기존 내부 스크롤 위치를 사용한다.
- 전체 목록 개수는 서버 `totalCount`, 분류 없는 상세 개수는 `savedCount`를 사용한다.
  분류별 개수는 보류 정책이므로 현재 조회 화면에서는 표시하지 않는다. 최종 표시 정책은 자문 후 반영한다.
- 생성·더보기 동작은 후속 mutation 화면이 제공한다. 상세 관리 동작은 `owner === true`일 때만 제공받는다.
- 제품 라우트의 전환은 생성·수정·관리 화면 연결 후 함께 진행한다.
  현재 `index.ts`·`lazyPages`·`appRoutes`와 지도 public props는 유지하며, 서버 조회와 목 mutation을 섞지 않는다.
- 인증 상태 전에는 보호 API를 요청하지 않는다. #221에 의존하는 계정별 캐시 격리·늦은 응답 차단은 앞서 정한 후속 범위다.

### 후속 PR의 mutation 계약

| 동작           | Endpoint                                                   | 성공 후 캐시                                       | 실패 시                   |
| -------------- | ---------------------------------------------------------- | -------------------------------------------------- | ------------------------- |
| 생성           | `POST /api/v1/collections`                                 | 서버 ID로 상세 저장, 목록·대상 목록 invalidate     | 입력 유지, 중복 이름 오류 |
| 수정·공개 전환 | `PATCH /api/v1/collections/{collectionId}`                 | 상세 setQueryData, 목록·대상 목록 invalidate       | 입력·현재 상태 유지       |
| 식당 저장      | `POST /api/v1/collections/{collectionId}/restaurants`      | 상세 갱신, 관련 식당·컬렉션 목록 invalidate        | 선택 유지                 |
| 식당 해제      | `DELETE /api/v1/collections/{collectionId}/restaurants`    | 상세 갱신, 관련 식당·컬렉션 목록 invalidate        | 선택 유지                 |
| 식당 이동      | `POST /api/v1/collections/{collectionId}/restaurants/move` | 양쪽 상세 갱신, 양쪽 식당·컬렉션 목록 invalidate   | 선택 유지                 |
| 컬렉션 삭제    | `DELETE /api/v1/collections/{collectionId}`                | 삭제 리소스 cache 정리, 목록 invalidate, 목록 복귀 | 현재 화면 유지            |

- 낙관적 갱신은 추가하지 않는다. 서버 성공 이후에만 입력·선택·모달을 정리한다.
- 부분 이동 UX는 유지한다. 대상 관계를 충분히 확인하고 이동 가능한 ID만 요청한다.
  일부 페이지에 없다는 이유로 중복이 아니라고 단정하지 않는다. 동시 변경으로 409가 발생하면 실패로 처리한다.
- 이름은 서버의 앞뒤 Unicode 공백 제거·중간 공백 유지 정책을 따른다.
- 신규 설명 입력은 사용자 확정대로 공백 포함 30자, 직접 줄바꿈 금지, 붙여넣기 줄바꿈은 공백 변환이다.
- PATCH의 생략·null은 유지, 빈 설명은 삭제다. 공개 전환 성공과 링크 복사 성공은 구분한다.

### 후속 PR의 cache·중복 확인 기준

- 조회 3개에 이어 write 6개의 endpoint 함수와 생성·수정·저장·해제·이동·삭제 mutation hook을 후속 PR에 추가한다.
- header 성공 응답을 반영하기 전에 진행 중인 동일 상세 조회를 취소해 이전 응답의 덮어쓰기를 막는다.
- 식당 관계 변경은 해당 컬렉션의 모든 정렬·분류 목록과 컬렉션/대상 목록을 갱신한다.
  이동은 양쪽 컬렉션에 적용하고, 삭제는 삭제 리소스의 조회를 취소하고 해당 cache만 정리한다.
- `getCollectionMovePlan`은 선택된 식당 ID를 기준으로 대상 컬렉션의 필요한 페이지를 조회한다.
  모든 선택 ID가 중복임을 확인한 경우에만 조기에 끝낸다. 일부 페이지 조회 실패·취소·cursor 순환은 실패로 처리한다.
- 중복 확인 결과는 쓰기 성공을 의미하지 않는다. 이후 실제 이동 요청의 409를 처리해야 하며 자동 재시도하지 않는다.
- 현재 hook과 endpoint는 제품 화면에서 호출하지 않는다. 화면 전환 전에 보류 정책과 함께
  인증 세션 변경 시 cache 격리·늦은 mutation 응답 처리, pending 중 중복 제출 차단을 연결·검증해야 한다.

## 보류 사항

다음 사항은 서버·기획 자문 후 해당 PR에 반영한다. 이미 병합됐다면 새 후속 PR로 처리한다.

1. 분류 필터 적용 중 `총 N곳`의 의미: 전체 저장 수인지 필터 결과 전체 수인지.
   현재 식당 목록 API는 필터 결과 전체 개수를 제공하지 않는다.
2. 전체 선택 범위: 현재 불러온 항목인지 추가 페이지까지 포함한 전체 결과인지.
3. 서버에 존재할 수 있는 31~100자 설명의 수정 정책. 자동 절단하지 않는다.
4. 실제 공유 URL 및 공개 컬렉션의 비로그인 열람 흐름. 임의 URL을 만들지 않는다.

보류 동작을 임의 정책으로 구현하거나 전체 화면 연동 완료로 표시하지 않는다.
독립적인 endpoint·query·mapper·mutation 작업은 계속 진행할 수 있다.

## Verification

- API wrapper: 경로·query·signal, ID 검증, 숫자/문자열 cursor, 잘못된 페이지 응답, 오류 전달.
- Query: 필터별 key, 조건부 실행, 페이지 추가·종료, 필터 전환, 취소,
  초기 오류와 추가 조회 실패·기존 데이터 유지·재시도.
- Mapper: summary/detail 분리, 필드 변환, 누락 값 보존, 미디어 정보 보존, 유효하지 않은 ID 거부.
- Write: PATCH 생략/빈 문자열, 공개 전환, 해제 query 직렬화, 이동 양쪽 header, 409/404 전달, 잘못된 ID 거부.
- Mutation cache: 생성 대상 목록 갱신, 수정 시 이전 상세 요청 취소, pending·실패 시 cache 유지,
  저장·해제의 필터별 목록 갱신, 이동 양쪽 갱신, 삭제 대상만 cache 제거.
- 이동 사전 조회: 뒤 페이지의 중복, 모든 선택이 중복인 경우의 종료, 추가 페이지 실패, cursor 순환, 취소.
- `VITE_API_BASE_URL` 없이 테스트한다. 실제 API base URL이나 계정 데이터에 의존하지 않는다.
- 제품 화면의 loading/error/empty/retry, 계정별 cache 격리, 실제 인증 조회는 제품 연결 단계의 별도 검증이다.
- 스타일만 확인하는 테스트는 추가하지 않는다.


## HASHI-224 공개 조회 보완 (2026-10-21)

- 공개 상세는 비로그인도 기존 상세·저장 식당 GET을 조회할 수 있도록 query 조건을 변경한다.
- 비로그인 상세 query key를 회원용과 분리하고 미사용 공개 query는 보관하지 않는다.
- 상세 또는 식당 목록이 404가 되면 이전 이름·식당 목록을 숨긴다.
- 내 컬렉션 목록은 계속 회원만 조회하며 관리 UI는 인증된 소유자에게만 제공한다.
- 이 브랜치는 조회 화면 기반을 제공한다. 실제 제품 라우트의 공개 진입은 최상위 관리 PR에서 연결한다.
- 필터별 전체 개수 응답 및 공유 URL 연결은 이번 보완에서 제외한다.
