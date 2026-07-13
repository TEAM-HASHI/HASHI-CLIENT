# Feature Spec: `AdminApiIntegration`

## Goal

- admin OpenAPI의 11개 operation과 user OpenAPI의 공개 식당·매거진 조회 및 이미지 업로드를 관리자 UI에 연결합니다.
- 실제 schema URL과 관리자 credential은 repository에 기록하지 않습니다.

## Query Map

| UI                        | Endpoint                                     | Query mode/key                                                 | States                                   |
| ------------------------- | -------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| Dashboard/reservations    | `GET /api/v1/admin/reservations`             | finite query, `adminQueryKeys.reservations.*`                  | loading/error/empty/success              |
| Reservation user          | `GET /api/v1/admin/reservations/{id}/user`   | enabled finite query                                           | loading/error/success                    |
| Published restaurants     | `GET /api/v1/restaurants`                    | infinite query, `restaurantQueryKeys.list(params)`             | loading/error/empty/success/next pending |
| Restaurant update prefill | summary + store-information + all menu pages | enabled composed query, `restaurantQueryKeys.prefill(id, row)` | loading/error/success                    |
| Published magazines       | `GET /api/v1/magazines`                      | infinite query, `magazineQueryKeys.list(params)`               | loading/error/empty/success/next pending |

- restaurant cursor는 opaque string으로 그대로 전달합니다.
- magazine/menu cursor는 schema의 number를 그대로 전달합니다.
- response를 바꾸는 filter와 size는 query key에 포함합니다.

## Mutation Map

| Action                          | Endpoint                                      | Success invalidation          |
| ------------------------------- | --------------------------------------------- | ----------------------------- |
| Login/logout                    | admin auth endpoints                          | logout은 admin cache clear    |
| Reservation status              | `POST /api/v1/admin/reservations/{id}/status` | reservation list prefix       |
| Restaurant create/update/delete | admin restaurant endpoints                    | `restaurantQueryKeys.lists()` |
| Magazine create/update/delete   | admin magazine endpoints                      | `magazineQueryKeys.lists()`   |

## Upload Boundary

1. `POST /api/v1/uploads/presigned-urls`에 `usage`, `files`(1~10개의 `contentType`, `fileSize`)를 전송합니다.
2. 응답의 `uploads` 항목별 `uploadUrl`로 동일한 `Content-Type`과 file body를 `PUT`합니다.
3. 성공한 `fileKey`만 admin create/update body에 포함합니다.
4. JPEG/PNG/WebP, 최대 5MB를 API 호출 전에 검증합니다.
5. 실패 파일은 재시도/제거할 수 있고 pending/failed count를 form validation에 전달합니다.

## Restaurant Write Rules

- create required scalar와 imageKeys/hashtags 최소 1개, 7개 businessHours를 검증합니다.
- menu는 name, description, priceCurrency, priceAmount, main을 완전한 값으로 직렬화합니다.
- 휴무일은 `{ dayOfWeek, closed: true }`만 전송합니다.
- open/close 순서, paired break, break 범위를 검증합니다.
- update scalar는 dirty field만 전송하고 빈 문자열로 clear하지 않습니다.
- collection은 전체 교체 toggle이 켜진 경우에만 body에 포함합니다.
- 기존 CDN URL을 storage key로 변환하지 않습니다.
- create/update 응답의 soft delete 상태는 `deleted` 필드를 사용합니다.

## Magazine Write Rules

- create는 title, uploaded bannerKey/thumbnailKey, http(s) Instagram URL을 요구합니다.
- update는 dirty title/URL과 새로 업로드된 banner/thumbnail만 전송합니다.
- title 150자, image key 500자, URL 255자 제한을 backend contract에 맞춥니다.

## Data Boundaries

- endpoint 함수는 low-level `request`만 사용하고 React/TanStack Query를 import하지 않습니다.
- admin과 user generated output을 분리하며 `apps/client` type을 cross-import하지 않습니다.
- page-local query key/hook/mutation에서 server state를 조립합니다.
- 공개 목록은 complete admin inventory로 표현하지 않습니다.

## Done Criteria

- query key factory, explicit initialPageParam/getNextPageParam, mutation invalidation이 구현됩니다.
- loading/error/empty/success/upload states가 UI에 연결됩니다.
- 식당·매거진 raw image key 입력을 primary UI로 노출하지 않습니다.
- `adminService`, `mockStore`, `Mock 상태` production 의존성이 없습니다.
- admin test, lint, typecheck, build가 통과합니다.
- backend repository는 변경하지 않습니다.
