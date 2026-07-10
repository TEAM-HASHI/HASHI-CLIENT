# HASHI-104 Error Boundary Design

## Context

HASHI Client already has a low-level `ky` request helper, TanStack Query, a
`QueryErrorResetBoundary`, `react-error-boundary`, HDS toast, and a top-level
Sentry boundary. The pieces are not yet connected into one error policy.

The current `ApiError` preserves the server envelope but drops the HTTP status.
The query retry policy checks only ky `HTTPError`, while `apiClient` uses
`throwHttpErrors: false`, so JSON 5xx responses are converted to a status-less
`ApiError` and are not retried. `AsyncBoundary` is outside `RouterProvider`, so
React Router's internal error boundary can render its default error page before
the intended fallback handles a route subtree error.

The backend has supplied external error codes and current Korean messages. The
attached ErrorBoundary reference recommends separating query fallback UI from
mutation notifications. HASHI Client must apply that separation without
globally turning expected 4xx form and domain failures into full-page errors.

## Goal

- Normalize backend error envelopes, HTTP-only failures, network failures,
  timeouts, and unexpected client errors into predictable presentation data.
- Preserve the actual HTTP status, external code, field errors, original
  response, and cause needed for retry decisions and diagnostics.
- Send only fatal query failures to the app error boundary by default.
- Keep expected 4xx and mutation failures close to the interaction that caused
  them.
- Render a HASHI-styled fallback with the mapped message and a working retry.
- Report errors consumed by the inner boundary to Sentry.
- Add no new dependency.

## Non-Goals

- Access-token injection, refresh-token rotation, request replay, logout, or
  authentication-state storage
- Automatic navigation for `COMMON-401` or `AUTH-*`
- Page-specific 404, forbidden, empty, or form field UI
- Operation-specific `endpoint + error code` policy registries
- Optimistic mutation rollback or query invalidation policy
- Changing the backend response schema or generated OpenAPI file

## Backend Error Contract

Known external codes use the following status and message as the frontend
catalog. Punctuation is part of the current copy contract.

| Domain      | HTTP status | External code     | Message                                                                                      |
| ----------- | ----------: | ----------------- | -------------------------------------------------------------------------------------------- |
| Common      |         400 | `COMMON-400`      | 잘못된 요청입니다                                                                            |
| Common      |         401 | `COMMON-401`      | 인증이 필요합니다                                                                            |
| Common      |         403 | `COMMON-403`      | 권한이 없습니다                                                                              |
| Common      |         404 | `COMMON-404`      | 리소스를 찾을 수 없습니다                                                                    |
| Common      |         405 | `COMMON-405`      | 허용되지 않은 요청 메서드입니다                                                              |
| Common      |         409 | `COMMON-409`      | 요청이 겹쳤습니다. 잠시 후 다시 시도해주세요                                                 |
| Common      |         415 | `COMMON-415`      | 지원하지 않는 요청 형식입니다                                                                |
| Common      |         500 | `COMMON-500`      | 서버 오류입니다                                                                              |
| Auth        |         401 | `AUTH-001`        | 유효하지 않은 토큰입니다                                                                     |
| Auth        |         401 | `AUTH-002`        | 만료된 토큰입니다                                                                            |
| Auth        |         401 | `AUTH-003`        | 리프레시 토큰이 존재하지 않습니다                                                            |
| Auth        |         401 | `AUTH-004`        | 이미 사용된 토큰입니다. 다시 로그인해주세요                                                  |
| Auth        |         401 | `AUTH-005`        | 카카오 인증에 실패했습니다                                                                   |
| Auth        |         401 | `AUTH-006`        | 유효하지 않은 온보딩 토큰입니다                                                              |
| Auth        |         502 | `AUTH-007`        | 카카오 서버와 통신할 수 없습니다                                                             |
| Auth        |         409 | `AUTH-008`        | 이미 가입된 소셜 계정입니다                                                                  |
| Auth        |         401 | `AUTH-009`        | 아이디 또는 비밀번호가 올바르지 않습니다                                                     |
| User        |         409 | `USER-001`        | 중복된 닉네임입니다                                                                          |
| User        |         409 | `USER-002`        | 이미 사용 중인 이메일입니다                                                                  |
| User        |         409 | `USER-003`        | 이미 사용 중인 연락처입니다                                                                  |
| User        |         409 | `USER-004`        | 이미 사용 중인 가입 정보입니다                                                               |
| User        |         404 | `USER-005`        | 회원을 찾을 수 없습니다                                                                      |
| Restaurant  |         400 | `RESTAURANT-001`  | 지원하지 않는 음식 장르입니다.                                                               |
| Restaurant  |         400 | `RESTAURANT-002`  | 지원하지 않는 정렬 기준입니다.                                                               |
| Restaurant  |         400 | `RESTAURANT-003`  | 지원하지 않는 식당 목록 유형입니다.                                                          |
| Restaurant  |         404 | `RESTAURANT-004`  | 식당을 찾을 수 없습니다.                                                                     |
| Restaurant  |         400 | `RESTAURANT-005`  | 지원하지 않는 큐레이션 유형입니다.                                                           |
| Restaurant  |         400 | `RESTAURANT-006`  | 영업시간 정보가 올바르지 않습니다. 모든 요일을 중복 없이 포함하고 시간 규칙을 지켜야 합니다. |
| Reservation |         404 | `RESERVATION-001` | 예약을 찾을 수 없습니다                                                                      |
| Reservation |         404 | `RESERVATION-002` | 예약하려는 식당을 찾을 수 없습니다                                                           |
| Reservation |         400 | `RESERVATION-003` | 사용 포인트가 결제 수수료를 초과했습니다                                                     |
| Reservation |         409 | `RESERVATION-004` | 이미 취소된 예약입니다                                                                       |
| Reservation |         409 | `RESERVATION-005` | 취소할 수 없는 상태의 예약입니다                                                             |
| Reservation |         400 | `RESERVATION-006` | 결제 금액이 수수료 계산과 일치하지 않습니다                                                  |
| Reservation |         404 | `RESERVATION-007` | 예약자를 찾을 수 없습니다                                                                    |
| Review      |         409 | `REVIEW-001`      | 이미 리뷰를 작성한 예약입니다.                                                               |
| Review      |         409 | `REVIEW-002`      | 방문 완료된 예약만 리뷰를 작성할 수 있습니다.                                                |
| Review      |         400 | `REVIEW-003`      | 지원하지 않는 리뷰 상태입니다.                                                               |
| Review      |         400 | `REVIEW-004`      | 지원하지 않는 리뷰 정렬 기준입니다.                                                          |
| Review      |         400 | `REVIEW-005`      | 지원하지 않는 리뷰 키워드입니다.                                                             |
| Review      |         404 | `REVIEW-006`      | 리뷰를 찾을 수 없습니다.                                                                     |
| Review      |         409 | `REVIEW-007`      | 등록 식당 예약만 리뷰를 작성할 수 있습니다.                                                  |
| Point       |         400 | `POINT-001`       | 보유 포인트가 부족합니다                                                                     |
| Point       |         400 | `POINT-002`       | 포인트 금액은 1 이상이어야 합니다                                                            |
| Point       |         404 | `POINT-003`       | 복원할 포인트 사용 내역을 찾을 수 없습니다                                                   |
| Point       |         409 | `POINT-004`       | 이미 복원된 포인트 사용 내역입니다                                                           |
| Upload      |         400 | `UPLOAD-001`      | 지원하지 않는 파일 사용 목적입니다.                                                          |
| Upload      |         400 | `UPLOAD-002`      | 지원하지 않는 파일 형식입니다.                                                               |
| Upload      |         400 | `UPLOAD-003`      | 업로드 가능한 파일 크기를 초과했습니다.                                                      |
| Magazine    |         404 | `MAGAZINE-001`    | 매거진을 찾을 수 없습니다.                                                                   |

## API Integration Map

### Target

- Shared HTTP boundary: `apps/client/src/shared/api`
- Query policy: `apps/client/src/shared/lib/queryClient.ts`
- Render boundary: `apps/client/src/app/providers/AsyncBoundary.tsx`
- Router placement: `apps/client/src/app/layout/RootLayout.tsx`
- Existing local-query exception: search page query
- Required auth: none for the error infrastructure itself

### Query Policy

| Failure                  | Default retry | Default presentation      | Local override                                           |
| ------------------------ | ------------: | ------------------------- | -------------------------------------------------------- |
| HTTP 400–499 `ApiError`  |             0 | Query state remains local | A page may explicitly throw or map to NotFound/Forbidden |
| HTTP 500–599 `ApiError`  |             1 | ErrorBoundary fallback    | A page may opt into a dedicated local fallback           |
| Network error            |             1 | ErrorBoundary fallback    | A page may keep it local                                 |
| Timeout error            |             1 | ErrorBoundary fallback    | A page may keep it local                                 |
| Unexpected non-API error |             0 | ErrorBoundary fallback    | Local handling must be explicit                          |

`useSuspenseQuery` follows TanStack Query's suspense error contract and can
throw when there is no usable data. A page that needs a local 4xx/404 branch
must use a non-suspense query or provide a nearer boundary with page-specific
fallback behavior.

### Mutation Policy

| Failure            | Retry | Default presentation                  | Feature ownership                                              |
| ------------------ | ----: | ------------------------------------- | -------------------------------------------------------------- |
| Known API code     |     0 | Toast with mapped message             | A local `onError` may replace the default with field/inline UI |
| HTTP-only failure  |     0 | Toast with HTTP fallback message      | Same                                                           |
| Network or timeout |     0 | Toast with transport fallback message | Same                                                           |
| Unexpected error   |     0 | Generic toast and Sentry diagnostics  | Same                                                           |

Mutation errors never navigate, clear auth state, or trigger the render
boundary in this ticket.

## Architecture

### Error catalog

`apps/client/src/shared/api` owns an immutable catalog keyed by the external
code. Each entry stores the expected HTTP status and the exact message above.
The external code remains a runtime string so a newly deployed backend code
does not make response parsing fail.

Presentation resolution uses this priority:

1. Known external code from an `ApiError`
2. Known common HTTP status when the response has no recognized envelope
3. Network or timeout fallback
4. Generic fallback for an unknown code or unexpected error

Unknown raw server messages are retained for diagnostics but are not rendered
as trusted product copy. Unknown external codes are also retained in the error
object and Sentry event.

### Normalized request error

`ApiError` preserves:

- actual HTTP status
- external code when present
- server message when present
- field errors
- parsed error response when present
- original cause when parsing or transport details exist

`request` parses the response defensively. A valid `success: false` envelope
becomes an `ApiError` with the actual status. A non-2xx empty, non-JSON, or
malformed response becomes an `ApiError` with status-only fallback data. A 2xx
response that does not match the success envelope is an unexpected contract
error rather than successful `null` data.

Transport policy always uses the actual HTTP status. The catalog's expected
status is display metadata and must not overwrite a mismatching server status.

### Query client

The query client uses shared pure predicates for retry and boundary routing.
This keeps retry and `throwOnError` decisions independently testable.

- Retry once for network, timeout, and actual 5xx failures.
- Do not retry expected 4xx or unexpected client errors.
- Throw actual 5xx, network, timeout, and unexpected errors to a render
  boundary by default.
- Keep actual 4xx `ApiError` instances in query state by default.
- Keep mutation `throwOnError` false and mutation retry disabled.
- Use the default mutation `onError` only as a fallback toast. A mutation hook
  with a local `onError` owns its form/inline presentation instead.

The existing search query explicitly keeps `throwOnError: false` because its
page already owns `SearchErrorState` and retry behavior.

### Boundary placement and fallback

`QueryClientProvider` remains above the router. `AsyncBoundary` moves from
outside `RouterProvider` to the `RootLayout` content boundary around `Outlet`.
This places it below React Router's internal root boundary, allowing it to
handle descendant render/query errors first.

`ToastRegion` stays outside `AsyncBoundary`, so mutation notifications remain
available while route content is healthy and are not coupled to the fallback.
The outer Sentry boundary remains the final catch for errors outside the route
content boundary.

The async fallback:

- uses `role="alert"`
- displays the mapped message
- displays a known external code as secondary diagnostic text
- exposes one `다시 시도` button
- resets both `react-error-boundary` and TanStack Query error state
- does not redirect or mutate authentication state

`AsyncBoundary` reports errors it consumes to Sentry because the outer Sentry
boundary will not receive an error that the inner boundary handled.

## Data Flow

```text
HTTP response / transport failure
  -> request parses and throws ApiError or transport error
  -> TanStack Query classifies the operation
     -> query 4xx: local query state
     -> query 5xx/network/timeout/unexpected: nearest AsyncBoundary
     -> mutation: local onError or default toast
  -> presentation resolver maps known code, HTTP status, or transport fallback
  -> original status/code/response/cause remain available to Sentry
```

## Accessibility and UX

- The fallback is an alert and has a visible retry control.
- The retry control is a semantic button with the existing HDS `Button`.
- User-visible messages come from the agreed catalog or safe client fallback,
  not arbitrary unknown server text.
- Mutation failures preserve the current screen and entered form values.
- Expected 4xx query failures do not replace the whole app by default.
- The fallback fits inside the existing mobile frame and does not introduce a
  second `main` landmark.

## Testing

Implementation follows red-green-refactor. Focused tests cover:

- all supplied external codes are present with their agreed status/message
- known code, common status, network, timeout, and unknown fallback priority
- `ApiError` retains actual status, response, code, field errors, and cause
- `request` preserves status for JSON 4xx/5xx responses
- empty, non-JSON, and malformed non-2xx responses become status-aware errors
- malformed 2xx responses fail as contract errors
- retry occurs once for 5xx/network/timeout and never for 4xx
- query boundary routing sends fatal failures to the boundary and keeps 4xx
  local
- mutation default handling renders one mapped toast and never throws
- a local mutation `onError` can own field/inline handling
- fallback renders mapped copy and resets the query boundary on retry
- `RootLayout` keeps `ToastRegion` outside the content boundary
- existing search local error behavior remains intact

Final verification runs client lint, typecheck, test, and build, plus the
repository format check.

## Documentation Impact

`docs/architecture/data-layer.md` must document the shared error catalog,
status-preserving `ApiError`, contextual query boundary policy, and mutation
fallback toast. No page spec changes are required because this ticket does not
add or integrate a page endpoint.

## Acceptance Criteria

1. Every backend code supplied for HASHI-104 exists once in the frontend error
   catalog with the agreed status and message.
2. `ApiError` and request failures preserve the actual HTTP status.
3. 5xx, network, and timeout queries retry once and reach the HASHI fallback
   when still failing.
4. Expected 4xx queries remain available to local UI by default.
5. Mutations do not throw to the render boundary and have a mapped fallback
   toast when no local error handler replaces it.
6. The fallback shows mapped copy and a retry that resets TanStack Query and
   the React error boundary.
7. React Router's default error page does not supersede the HASHI route-content
   boundary for descendant failures.
8. Errors consumed by the inner boundary are captured by Sentry.
9. Existing user changes in `useAuthStatus.ts` are untouched by HASHI-104.
10. Client lint, typecheck, test, build, and repository format checks pass.
