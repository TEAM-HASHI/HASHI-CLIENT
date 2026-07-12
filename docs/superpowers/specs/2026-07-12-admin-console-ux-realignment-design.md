# Admin Console UX Realignment Design

## Goal

HASHI-91 관리자 화면을 최신 `HASHI-SERVER/develop` 계약과 현재 dev OpenAPI에 맞추고, 기존 관리자 UI의 목록·drawer·단계형 form UX를 실제 데이터와 실제 업로드 흐름으로 복원한다.

백엔드 저장소는 계약 확인 용도로만 읽으며 수정하지 않는다. 클라이언트 변경은 `apps/admin`을 중심으로 제한하고, 사용자가 요청하기 전에는 commit하지 않는다.

## Sources of Truth

1. `HASHI-SERVER`의 admin/upload/public restaurant/public magazine controller, DTO, domain enum, validation
2. 현재 dev raw OpenAPI
   - admin operation과 schema
   - user schema의 public 조회와 upload operation
3. 기존 `feat/HASHI-91-admin-console`의 table, drawer, stepper, loading/error/empty interaction

현재 dev admin schema는 백엔드의 restaurant API alignment 배포를 반영한다. 기존 admin generated type은 이전 계약이므로 구현 전에 재생성한다.

## Backend Contract Findings

### Restaurant create

필수 필드:

- `name`: 100자 이하
- `localName`: 100자 이하
- `summary`: 100자 이하
- `description`: 500자 이하
- `address`: 255자 이하
- `area`: 20자 이하
- `genre`
- `foodCategory`
- `priceCurrency`: 3자리
- `minPrice`, `maxPrice`: 0 이상이며 `minPrice <= maxPrice`
- `imageKeys`: 1개 이상, 첫 이미지가 대표 이미지
- `hashtags`: 1개 이상, 항목당 20자 이하
- `businessHours`: 월요일부터 일요일까지 중복 없는 7개

선택 필드:

- `menus`
- `curationTypes`

지원 값:

- genre/food category: `sushi`, `noodle`, `rice-bowl`, `nabe`, `fried`, `grill`, `etc`
- currency: `JPY`, `KRW`, `USD`
- curation: `sns-hot`, `popular`, `hashi-pick`, `today-restaurant`

메뉴는 `name`, `description`, `priceCurrency`, `priceAmount`, `main`이 필요하고 `imageKey`는 선택이다.

영업일은 `openTime < closeTime`이어야 한다. 브레이크타임은 시작·종료를 함께 입력하고 영업시간 안에 있어야 한다. 휴무일은 모든 시간 값을 보내지 않는다.

### Restaurant update/delete

- PATCH에서 null/미전송 필드는 유지된다.
- 기존 값을 빈 문자열로 지우는 것은 지원하지 않는다.
- `imageKeys`, `menus`, `hashtags`, `curationTypes`, `businessHours`는 보내면 전체 교체된다.
- `imageKeys`, `hashtags`를 교체할 때는 최소 1개가 필요하다.
- `businessHours`를 교체할 때는 7개 요일 전체가 필요하다.
- delete는 soft delete이며 기존 예약·리뷰는 유지하고 사용자 노출만 중단한다.

### Magazine

- create 필수: `title` 150자 이하, `bannerKey` 500자 이하, `instagramRedirectUrl` 255자 이하
- PATCH는 보낸 필드만 변경한다.
- delete는 관리자 delete operation을 사용한다.

### Upload

- `POST /api/v1/uploads/presigned-urls`
- ADMIN 권한 사용 가능
- usage: `restaurant`, `restaurant-menu`, `magazine`
- MIME: JPEG, PNG, WebP
- 최대 크기: 5MB
- 응답의 `uploadUrl`로 원본 파일을 PUT한 뒤 `fileKey`를 create/update body에 사용한다.

## Chosen Approach

공개 조회 API와 관리자 mutation API를 조합한다.

- 공개 API는 현재 사용자에게 노출되는 식당·매거진 목록과 상세를 제공한다.
- 관리자 API는 생성·수정·삭제의 유일한 write boundary다.
- upload API는 실제 파일을 object storage에 올리고 key를 자동으로 form에 연결한다.
- 공개 조회에 없는 inactive/soft-deleted resource는 ID 직접 입력 작업을 지원한다.

공개 목록을 전체 관리자 inventory처럼 표현하지 않고 화면에 `현재 공개 중` 범위를 명시한다.

## Restaurant UX

### List

- 실제 `GET /api/v1/restaurants` 결과를 table로 표시한다.
- keyword, genre, food category, sort를 서버 query에 연결한다.
- cursor pagination은 더 보기 또는 다음 페이지 UX로 연결한다.
- row에는 대표 이미지, 식당명, 지역, 장르, 음식 카테고리, 요약, 평점을 표시한다.
- row action은 `수정`, `삭제`를 제공한다.
- 목록 밖 resource를 위한 `ID로 수정/삭제` 보조 action을 제공한다.
- loading, background fetching, error/retry, empty 상태를 구분한다.

### Create drawer

기존 4단계 drawer/stepper UX를 복원한다.

1. 기본 정보
   - 식당명, 현지명, 한 줄 소개, 상세 설명, 주소, 지역
   - 장르와 음식 카테고리는 select
   - 글자 수와 필수 validation을 즉시 표시
2. 가격과 이미지
   - 통화 select와 최소·최대 가격
   - 실제 다중 이미지 upload
   - drag/reorder 또는 위·아래 이동으로 첫 이미지를 대표 이미지로 지정
   - 파일별 preview, progress/pending, retry, remove
3. 영업시간
   - 고정된 7개 요일 row
   - open, close, optional break start/end, closed
   - 첫 요일 시간을 전체 적용
   - 휴무 선택 시 시간을 제거
4. 메뉴와 노출
   - 메뉴 추가/제거, 대표 메뉴 checkbox, 통화 select, 가격
   - 메뉴 이미지 실제 upload
   - 해시태그 chip input
   - 큐레이션 multi-checkbox

마지막 단계에서 전체 validation summary를 보여주고 성공 응답의 restaurant ID와 주요 결과를 표시한다.

### Update drawer

row에서 진입하면 다음 공개 query를 조합해 가능한 필드를 미리 채운다.

- list row: area, genre, food category, hashtags
- summary: name, local name, summary, address, image URL
- store information: description, business hours, price range
- menu list: menus

공개 응답에는 기존 object key와 curation 전체 정보가 없으므로 다음 정책을 사용한다.

- scalar field는 사용자가 실제로 변경한 값만 PATCH에 포함한다.
- 이미지, 메뉴, 해시태그, 큐레이션, 영업시간은 섹션별 `전체 교체` toggle을 켠 경우에만 포함한다.
- 이미지/메뉴 교체는 새 파일 upload 결과 key만 보낸다. 기존 URL에서 key를 추측하지 않는다.
- 교체 toggle 옆에 기존 목록이 삭제되고 입력한 목록으로 바뀐다는 경고를 표시한다.
- ID 직접 수정은 prefill 없이 동일한 PATCH drawer를 사용한다.

### Delete

- soft delete이고 공개 목록에서 숨겨진다는 의미를 확인 dialog에 표시한다.
- delete 성공 후 공개 restaurant list query를 invalidate한다.
- 실패 시 backend message/code를 dialog 안에 표시한다.

## Magazine UX

### List

- 실제 `GET /api/v1/magazines` cursor 목록을 사용한다.
- 배너 preview, 제목, Instagram URL, 생성일을 표시한다.
- 더 보기, loading, error/retry, empty 상태를 제공한다.
- 공개 목록 범위와 ID 직접 작업 action을 표시한다.

### Create/update drawer

- 생성 field는 title, banner image, Instagram URL만 노출한다.
- banner는 `magazine` usage의 실제 upload를 사용한다.
- URL field는 URL 형식을 검증한다.
- update는 공개 목록의 title/URL을 prefill한다.
- 기존 banner key는 공개 응답에 없으므로 새 배너를 선택했을 때만 `bannerKey`를 PATCH에 포함한다.
- ID 직접 수정은 빈 optional PATCH form으로 진입한다.

### Delete

- 확인 dialog와 pending 중복 방지를 제공한다.
- 성공 후 public magazine list query를 invalidate한다.

## Data Boundaries

- admin generated OpenAPI는 최신 `/v3/api-docs/admin`에서 재생성한다.
- upload/public read 타입은 `/v3/api-docs/user`에서 admin 전용 별도 generated file로 생성한다. `apps/client` generated type을 import하지 않는다.
- endpoint 함수는 `request`/`apiClient`만 사용하고 React/TanStack Query를 import하지 않는다.
- public list/detail/upload query와 mutation key는 admin app 내부 factory로 관리한다.
- page는 generated `paths`/`components`를 직접 import하지 않는다.
- form serializer가 create body와 changed-only update body를 생성한다.

## Upload Data Flow

1. 클라이언트에서 MIME과 5MB 제한을 먼저 검사한다.
2. presigned URL을 발급한다.
3. 반환된 `uploadUrl`에 동일한 `Content-Type`으로 파일을 PUT한다.
4. 성공한 `fileKey`와 `fileUrl`을 form item에 저장한다.
5. 모든 필수 upload가 성공한 뒤에만 resource mutation을 허용한다.

form 취소 후 이미 업로드된 orphan object를 삭제하는 API는 현재 없다. 자동 정리를 가장하지 않으며, backend cleanup 정책이 생기기 전까지 residual limitation으로 문서화한다.

## Error and Validation UX

- client validation은 backend 길이, 필수, 범위, enum, 7요일, 시간 규칙을 그대로 반영한다.
- field error가 있으면 해당 단계와 field에 표시한다.
- upload error는 파일 item 단위로 retry/remove할 수 있다.
- query error는 page-local retry를 제공한다.
- mutation error는 drawer/dialog 안에서 backend code/message를 표시한다.
- pending 중 submit/delete/upload 중복 실행을 막는다.
- 401은 기존 admin session 정책에 따라 로그인 화면으로 유도하는 후속 검증 대상이다.

## Component Boundaries

- page: route composition, query orchestration, drawer/dialog target
- page-local restaurant components: table, stepper form, business hour rows, menu editor, replacement section
- page-local magazine components: table, compact form
- admin shared: authenticated image uploader처럼 식당·메뉴·매거진에서 재사용되는 upload primitive
- HDS: Button, InputField, Checkbox 등 제품 비의존 primitive만 재사용

큰 page 파일 하나에 form과 serializer를 다시 합치지 않는다.

## Testing

- latest generated contract에 맞는 restaurant/magazine endpoint test
- upload presign request와 PUT header/body test
- enum option과 serializer field-name test
- create required validation, price range, seven-day coverage, break-time validation test
- update changed-only scalar와 collection replacement omission/inclusion test
- restaurant public list/detail/menu query composition test
- magazine public list query test
- create/update/delete/upload page interaction test
- mock UI와 raw genre/currency/curation input이 없는지 test
- admin lint, typecheck, test, build
- repository lint, typecheck, test, build, format check

## Done Criteria

- 최신 backend create/update field와 validation이 모두 client form/serializer에 반영된다.
- genre, food category, currency, curation은 선택형이다.
- 식당·메뉴·매거진 이미지가 실제 presigned upload를 사용한다.
- 기존 table, drawer, stepper 수준의 UX가 실제 query/mutation으로 복원된다.
- public 목록의 범위와 collection 전체 교체 위험을 UI에서 오해 없이 안내한다.
- backend repository에는 변경 사항이 없다.
- commit은 사용자가 요청할 때만 수행한다.
