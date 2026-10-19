# Feature Spec: `AdminApiIntegration`

## Goal

- published admin OpenAPI operation과 user OpenAPI의 공개 식당·매거진 조회, 이미지 업로드, token reissue를 관리자 UI에 연결합니다.
- 아직 admin OpenAPI에 배포되지 않은 회원 목록은 HASHI-142 backend spec을 page-local 계약으로 연결하고 schema 배포 후 generated 타입으로 교체합니다.
- 실제 schema URL과 관리자 credential은 repository에 기록하지 않습니다.

## Query Map

식당 위치 검토·보정은 `pages/restaurantLocations/RestaurantLocationsPage.spec.md`를 따른다. 기존 식당의 상태·검토 목록·재요청·Places 후보 검색·선택을 연결한다. 유료 후보 검색은 자동 실행하지 않는다.

등록 전 위치 미리보기(HASHI-236)는 등록 화면의 버튼으로만 `POST /api/v1/admin/restaurants/location-preview`를 호출한다. 최종 등록과 동일하게 정리한 식당명·현지명·주소로 검색하며 선택 토큰만 `locationSelectionToken`으로 전달한다. 입력 변경·닫기 시 후보와 선택을 폐기하고 진행 중 검색을 중단한다. 선택 토큰 만료는 등록 직전에도 확인하며, 선택 해제 또는 재검색 후 진행한다. 서버의 토큰 오류(027/028)는 입력을 보존하고 기본 정보 단계로 돌아간다. 후보 없이 등록하는 기존 흐름과 수정 화면은 유지한다. 미리보기 결과는 영구 저장하거나 자동 재검색하지 않는다.

관광 지역 관리·식당 배정(HASHI-237)은 `pages/mapRegions/MapRegionsPage.spec.md`를 따른다. 지역 목록·전체 설정 PUT·명시적 식당 배정/해제를 연결하며 사용자 지도나 위치 검증 작업은 변경하지 않는다.

공지사항 관리는 `pages/notices/NoticesPage.spec.md`를 따른다. 관리자 전용 목록·상세·생성·수정·게시·삭제와 NOTICE media asset 업로드를 연결하며 별도 generated 계약을 사용한다. `pnpm --filter @hashi/admin gen:notice-api-types`로 해당 범위만 갱신한다.

이용약관 관리는 `pages/terms/TermsPage.spec.md`를 따른다. 기존 admin generated 계약으로 유형·버전 이력·상세·초안 저장·게시·삭제를 연결한다. 게시된 버전은 읽기 전용이며 새 버전 게시 시 기존 현재 버전 캐시도 재조회한다.

| UI                        | Endpoint                                     | Query mode/key                                                 | States                                   |
| ------------------------- | -------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| Dashboard/reservations    | `GET /api/v1/admin/reservations`             | finite query, `adminQueryKeys.reservations.*`                  | loading/error/empty/success              |
| Users                     | `GET /api/v1/admin/users`                    | finite query, `userQueryKeys.list(params)`                     | loading/error/empty/success/fetching     |
| Reservation user          | `GET /api/v1/admin/reservations/{id}/user`   | enabled finite query                                           | loading/error/success                    |
| Published restaurants     | `GET /api/v1/restaurants`                    | infinite query, `restaurantQueryKeys.list(params)`             | loading/error/empty/success/next pending |
| Restaurant update prefill | summary + store-information + all menu pages | enabled composed query, `restaurantQueryKeys.prefill(id, row)` | loading/error/success                    |
| Published magazines       | `GET /api/v1/magazines`                      | infinite query, `magazineQueryKeys.list(params)`               | loading/error/empty/success/next pending |

- restaurant cursor는 opaque string으로 그대로 전달합니다.
- magazine/menu cursor는 schema의 number를 그대로 전달합니다.
- response를 바꾸는 filter와 size는 query key에 포함합니다.
- user list는 `sort`, trimmed optional `keyword`, zero-based `page`, `size=20`을 key와 request에 포함합니다.

## Auth Recovery

1. 보호 API의 첫 `401`은 `POST /api/v1/auth/reissue`를 호출합니다.
2. 동시 `401` 요청은 하나의 in-flight reissue를 공유합니다.
3. 새 access token을 session에 반영한 뒤 각 원 요청을 한 번만 재시도합니다.
4. auth endpoint는 recursive reissue 대상에서 제외합니다.
5. reissue 실패 또는 재시도 `401`은 session을 지우고 route guard가 `/admin/login`으로 이동합니다.

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
- 회원 목록의 search, sort, offset pagination과 loading/error/empty/fetching 상태가 구현됩니다.
- access token 만료 시 single-flight reissue, one-time replay, terminal login redirect가 구현됩니다.
- loading/error/empty/success/upload states가 UI에 연결됩니다.
- 식당·매거진 raw image key 입력을 primary UI로 노출하지 않습니다.
- `adminService`, `mockStore`, `Mock 상태` production 의존성이 없습니다.
- admin test, lint, typecheck, build가 통과합니다.
- backend repository는 변경하지 않습니다.
