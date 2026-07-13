# Page Spec: `AdminConsole`

## Purpose

- HASHI 관리자용 로그인, 예약 처리, 식당·매거진 콘텐츠 관리를 제공합니다.
- 쓰기는 admin OpenAPI, 공개 목록·수정 prefill·업로드는 user OpenAPI generated type을 기준으로 합니다.
- 공개 목록은 전체 관리자 재고가 아니므로 UI에 `현재 공개 중` 범위를 명시합니다.

## Routes and Access

| Route                 | Access     | Page                       |
| --------------------- | ---------- | -------------------------- |
| `/admin/login`        | guest only | 관리자 로그인              |
| `/admin/dashboard`    | admin only | 예약 기반 대시보드         |
| `/admin/reservations` | admin only | 예약 목록 및 상태 관리     |
| `/admin/restaurants`  | admin only | 공개 식당 및 관리자 쓰기   |
| `/admin/magazines`    | admin only | 공개 매거진 및 관리자 쓰기 |

- 인증되지 않은 `/admin/*` 요청은 `/admin/login`으로 이동합니다.
- 인증된 사용자가 로그인 페이지에 접근하면 `/admin/dashboard`로 이동합니다.

## Authentication and Reservations

- 로그인은 `POST /api/v1/auth/admin/login`, 로그아웃은 `POST /api/v1/auth/admin/logout`을 사용합니다.
- bearer token과 credential cookie를 함께 사용합니다.
- 예약 목록은 `GET /api/v1/admin/reservations`, 예약자 조회와 상태 변경은 각 admin endpoint를 사용합니다.
- 예약 목록 query는 상태·page·size를 key에 포함하고 상태 변경 성공 후 목록 prefix를 invalidate합니다.

## Restaurants

### Data Dependencies

- 공개 목록: `GET /api/v1/restaurants` (`keyword`, `genre`, `foodCategory`, `sort`, opaque `cursor`, `size`)
- 수정 prefill: summary, store-information, 모든 menu cursor page를 합성합니다.
- 생성·수정·삭제: admin restaurant endpoints만 사용합니다.
- 공개 URL은 미리보기 전용이며 object key로 추론하지 않습니다.

### UX and Contract

- 공개 식당은 검색·선택형 filter·cursor `더 보기`가 있는 table로 표시합니다.
- 등록은 `기본 정보 → 가격·이미지 → 영업시간 → 메뉴·노출` 4단계 large drawer입니다.
- `genre`, `foodCategory`, `priceCurrency`, `curationTypes`는 백엔드 값에 고정된 선택 control입니다.
- 생성 body는 `name`, `localName`, `summary`, `description`, `address`, `area`, `genre`, `foodCategory`, `priceCurrency`, `minPrice`, `maxPrice`, `imageKeys`, `menus`, `hashtags`, `curationTypes`, `businessHours`를 사용합니다.
- 식당 이미지는 최소 1개이며 첫 이미지가 대표 이미지입니다. 영업시간은 중복 없는 7개 요일을 전송합니다.
- PATCH scalar는 dirty field만 전송합니다. images, menus, hashtags, curationTypes, businessHours는 `전체 교체`를 명시적으로 켠 경우에만 전송합니다.
- 공개 목록에 없는 식당은 numeric ID로 직접 수정·비공개 처리할 수 있습니다.
- delete는 백엔드 soft delete임을 확인 문구에 표시합니다.

## Magazines

### Data Dependencies

- 공개 목록: `GET /api/v1/magazines`의 numeric cursor와 size를 사용합니다.
- 생성·수정·삭제: admin magazine endpoints만 사용합니다.

### UX and Contract

- 공개 매거진 table은 배너, 제목, Instagram URL, 등록일을 표시합니다.
- drawer는 `title`, 실제 업로드로 얻은 `bannerKey`, `thumbnailKey`, `instagramRedirectUrl`만 전송합니다.
- 수정 시 title/URL은 dirty field만, banner/thumbnail은 각 새 이미지 업로드가 성공했을 때만 전송합니다.
- 공개 목록에 없는 매거진은 numeric ID로 직접 수정·삭제할 수 있습니다.
- region, series, genre, card news 같은 미지원 field는 제공하지 않습니다.

## Upload

- `POST /api/v1/uploads/presigned-urls`로 URL을 받은 뒤 같은 MIME type으로 object storage에 `PUT`합니다.
- 허용 형식은 JPEG/PNG/WebP, 크기는 파일당 최대 5MB입니다.
- 식당, 메뉴, 매거진 usage를 구분하고 pending/failed 상태에서는 submit을 막습니다.
- 이미 object storage에 올라간 뒤 form을 취소한 orphan object를 삭제하는 API는 현재 없으므로 자동 정리를 보장하지 않습니다.

## Generated Contracts

- admin write output: `apps/admin/src/shared/api/generated/openapi.ts`
- public read/upload output: `apps/admin/src/shared/api/generated/user-openapi.ts`
- 환경변수: `ADMIN_OPENAPI_SCHEMA_URL`, `USER_OPENAPI_SCHEMA_URL`
- 명령: `pnpm gen:admin-api-types`, `pnpm gen:admin-user-api-types`, `pnpm gen:admin-all-api-types`
- generated 파일은 직접 수정하지 않습니다.

## UI States and Verification

- query는 loading, error/retry, empty, success, next-page pending을 구분합니다.
- mutation과 upload pending 중 중복 실행을 막고 error는 drawer/dialog 안에 표시합니다.
- endpoint path/query/body, cursor, query key, invalidation, serializer, upload PUT, page interaction을 자동 테스트합니다.
