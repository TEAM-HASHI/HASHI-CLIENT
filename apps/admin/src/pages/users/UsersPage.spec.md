# Page Spec: `UsersPage`

## Purpose

- 관리자가 전체 회원의 기본 정보를 확인합니다.
- 닉네임 부분 일치 검색과 정렬로 필요한 회원을 찾습니다.
- 서버의 offset 페이지네이션 결과와 전체 회원 수를 표시합니다.

## Route

| Item        | Value                          |
| ----------- | ------------------------------ |
| Path        | `/admin/users`                 |
| Route key   | `ROUTES.users`                 |
| Access      | `AdminOnlyRoute`               |
| Layout      | `AdminLayout`                  |
| Loading     | `lazyPages.UsersPage` Suspense |
| Guest entry | `/admin/login` redirect        |

## Requirements

- 기본 정렬은 가입일 최신순(`CREATED_AT`)입니다.
- 정렬을 닉네임 가나다순(`NICKNAME`)으로 바꾸면 첫 페이지부터 다시 조회합니다.
- 닉네임 입력이 멈춘 뒤 300ms가 지나면 앞뒤 공백을 제거한 마지막 검색어로 자동 조회하고 첫 페이지로 초기화합니다.
- 300ms 안에 입력이 이어지면 중간 검색어는 적용하지 않습니다.
- 공백 검색어는 query에서 생략해 전체 목록을 조회합니다.
- 페이지 번호는 0부터 시작하고 페이지 크기는 20으로 고정합니다.
- 표에는 프로필, 닉네임, 영문 이름, 생년월일, 전화번호, 이메일, 가입일을 표시합니다.
- `nameEng`, `profileImageUrl`이 `null`이면 각각 `-`와 프로필 fallback을 표시합니다.
- 검색·정렬·페이지 이동 중 기존 데이터를 유지하고 목록 갱신 상태를 알립니다.
- 숫자 pagination은 현재 페이지를 강조하고 원하는 페이지로 직접 이동합니다.
- 전체 페이지가 8개 이상이면 첫·마지막 페이지와 현재 페이지 주변을 유지하고 생략 구간을 `…`로 표시합니다.
- 전체 페이지가 0이면 pagination을 표시하지 않습니다.
- 이전·다음 화살표는 서버의 `page`, `totalPages` 범위를 넘지 않습니다.

## API Integration Map

### Target

- Page: `UsersPage`
- Route params: 없음
- Search params: 없음. 검색·정렬·페이지는 페이지 local state입니다.
- Required auth: `Authorization: Bearer {token}` (`ROLE_ADMIN`)

### Source Docs

- API spec: HASHI-142 회원 목록 명세
- Published admin OpenAPI: `/v3/api-docs/admin`
- OpenAPI status: 2026-07-17 기준 `GET /api/v1/admin/users`가 아직 배포되지 않았습니다.

### Queries

| UI area | Endpoint                  | Params                            | Response data                                       | Query key                    | Mode       | States                                   |
| ------- | ------------------------- | --------------------------------- | --------------------------------------------------- | ---------------------------- | ---------- | ---------------------------------------- |
| 회원 표 | `GET /api/v1/admin/users` | `sort`, `keyword`, `page`, `size` | `users`, `page`, `size`, `totalCount`, `totalPages` | `userQueryKeys.list(params)` | `useQuery` | loading, error, empty, success, fetching |

### Mutations

- 없음

### Type Mapping

| API field         | UI use    | Nullable | Transform                          |
| ----------------- | --------- | -------- | ---------------------------------- |
| `userId`          | row key   | no       | 없음                               |
| `nickname`        | 닉네임    | no       | 없음                               |
| `nameEng`         | 영문 이름 | yes      | `null`이면 `-`                     |
| `birthDate`       | 생년월일  | no       | ISO date 문자열 그대로 표시        |
| `phone`           | 전화번호  | no       | 서버 문자열 그대로 표시            |
| `email`           | 이메일    | no       | 없음                               |
| `profileImageUrl` | 프로필    | yes      | `null`이면 닉네임 첫 글자 fallback |
| `createdAt`       | 가입일    | no       | `yyyy-MM-dd HH:mm` 형태로 축약     |

### Missing Questions

- dev admin OpenAPI에 endpoint가 배포되면 page-local 타입을 generated 타입 alias로 교체해야 합니다.

## State

- Local: 입력 중인 검색어, 적용된 검색어, 정렬, 현재 페이지
- Server: 회원 목록 query 결과
- Derived: 빈 결과 문구, pagination item과 disabled, background fetching 상태

## Component Mapping

- Admin shared: `PageHeader`, `AdminToolbar`, `AdminSearchInput`, `AdminSelect`, `AdminTable`, `AdminPagination`
- Page-local: `UserTable`
- HDS: 없음
- Icon: sidebar `PeopleIcon`, pagination `BackIcon`, `NextIcon`

## Error And Empty States

- 초기 loading은 `AdminTable` skeleton row를 표시합니다.
- `400`, `403`, network/server 실패는 table error와 `다시 시도`를 표시합니다.
- 검색어가 적용된 빈 결과는 `검색 결과가 없습니다`를 표시합니다.
- 전체 목록이 빈 결과면 `가입한 회원이 없습니다`를 표시합니다.
- terminal `401`은 공통 auth refresh 실패 처리 후 로그인 페이지로 이동합니다.

## Verification

```bash
pnpm --filter @hashi/admin lint
pnpm --filter @hashi/admin typecheck
pnpm --filter @hashi/admin test
pnpm --filter @hashi/admin build
git diff --check
```

- 직접 URL `/admin/users` 진입과 비로그인 redirect를 확인합니다.
- 닉네임 입력이 300ms 디바운스된 뒤 마지막 값만 trim되어 전송되고 검색 시 page가 0으로 초기화되는지 확인합니다.
- loading, error/retry, empty, success, background fetching, 숫자 직접 이동, 첫/마지막 페이지를 확인합니다.
