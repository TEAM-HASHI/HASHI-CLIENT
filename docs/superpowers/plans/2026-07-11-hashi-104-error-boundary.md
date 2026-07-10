# HASHI-104 Error Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버의 50개 외부 오류 코드를 안전하게 정규화하고, 치명적 query 오류는 재시도 가능한 HASHI ErrorBoundary로, 예상 가능한 4xx와 mutation 오류는 로컬 상태 또는 toast로 전달한다.

**Architecture:** `shared/api`가 오류 catalog, status를 보존하는 `ApiError`, 안전한 응답 파싱, 사용자 표시용 resolver를 소유한다. `shared/lib/queryClient.ts`는 순수 정책 함수로 query retry/throw와 mutation fallback toast를 조립하고, Router 내부 `RootLayout`의 `AsyncBoundary`가 route content 오류를 TanStack Query reset과 함께 복구한다.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, ky 2, TanStack Query 5, React Router 7, react-error-boundary 6, Sentry 10, HDS UI Toast/Button, Vitest 3, Testing Library

## Global Constraints

- `AUTH-*`는 메시지만 정규화하며 token refresh, logout, request replay를 구현하지 않는다.
- 실제 HTTP status가 retry와 boundary 정책의 기준이며 catalog status는 표시 계약으로만 사용한다.
- 알려진 4xx query는 기본적으로 로컬 query state에 남긴다.
- 5xx, network, timeout query만 1회 재시도한다.
- mutation은 retry하거나 render boundary로 throw하지 않는다.
- mutation의 개별 `onError`는 전역 fallback toast를 대체할 수 있다.
- 알 수 없는 서버 메시지는 제품 문구로 직접 노출하지 않는다.
- 새 dependency와 generated OpenAPI 변경을 추가하지 않는다.
- 기존 `apps/client/src/shared/hooks/useAuthStatus.ts` 사용자 수정은 stage하거나 변경하지 않는다.

---

### Task 1: Error catalog, normalized error, and presentation resolver

**Files:**

- Create: `apps/client/src/shared/api/errorCatalog.test.ts`
- Create: `apps/client/src/shared/api/errorCatalog.ts`
- Create: `apps/client/src/shared/api/errorPresentation.test.ts`
- Create: `apps/client/src/shared/api/errorPresentation.ts`
- Create: `apps/client/src/shared/api/apiError.test.ts`
- Modify: `apps/client/src/shared/api/apiError.ts`
- Modify: `apps/client/src/shared/api/index.ts`

**Interfaces:**

- Consumes: backend external code/status/message contract; existing `ErrorResponse` and `FieldError`.
- Produces: `ERROR_CATALOG`, `getErrorCatalogEntry(code)`, `getCommonErrorCatalogEntryByStatus(status)`, `ApiError({ status, response, cause })`, `getErrorPresentation(error)`.

- [x] **Step 1: Write failing catalog and normalized-error tests**

Create `errorCatalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import {
  ERROR_CATALOG,
  getCommonErrorCatalogEntryByStatus,
} from '@/shared/api/errorCatalog'

const EXPECTED_ERROR_CODES = [
  'AUTH-001',
  'AUTH-002',
  'AUTH-003',
  'AUTH-004',
  'AUTH-005',
  'AUTH-006',
  'AUTH-007',
  'AUTH-008',
  'AUTH-009',
  'COMMON-400',
  'COMMON-401',
  'COMMON-403',
  'COMMON-404',
  'COMMON-405',
  'COMMON-409',
  'COMMON-415',
  'COMMON-500',
  'MAGAZINE-001',
  'POINT-001',
  'POINT-002',
  'POINT-003',
  'POINT-004',
  'RESERVATION-001',
  'RESERVATION-002',
  'RESERVATION-003',
  'RESERVATION-004',
  'RESERVATION-005',
  'RESERVATION-006',
  'RESERVATION-007',
  'RESTAURANT-001',
  'RESTAURANT-002',
  'RESTAURANT-003',
  'RESTAURANT-004',
  'RESTAURANT-005',
  'RESTAURANT-006',
  'REVIEW-001',
  'REVIEW-002',
  'REVIEW-003',
  'REVIEW-004',
  'REVIEW-005',
  'REVIEW-006',
  'REVIEW-007',
  'UPLOAD-001',
  'UPLOAD-002',
  'UPLOAD-003',
  'USER-001',
  'USER-002',
  'USER-003',
  'USER-004',
  'USER-005',
]

describe('ERROR_CATALOG', () => {
  it('contains every HASHI-104 external error code exactly once', () => {
    expect(Object.keys(ERROR_CATALOG).sort()).toEqual(EXPECTED_ERROR_CODES)
  })

  it('preserves agreed status, copy, and punctuation', () => {
    expect(ERROR_CATALOG['COMMON-409']).toEqual({
      status: 409,
      message: '요청이 겹쳤습니다. 잠시 후 다시 시도해주세요',
    })
    expect(ERROR_CATALOG['RESTAURANT-006']).toEqual({
      status: 400,
      message:
        '영업시간 정보가 올바르지 않습니다. 모든 요일을 중복 없이 포함하고 시간 규칙을 지켜야 합니다.',
    })
    expect(ERROR_CATALOG['AUTH-007']).toEqual({
      status: 502,
      message: '카카오 서버와 통신할 수 없습니다',
    })
    expect(ERROR_CATALOG['MAGAZINE-001']).toEqual({
      status: 404,
      message: '매거진을 찾을 수 없습니다.',
    })
  })

  it('resolves a common fallback from an HTTP status', () => {
    expect(getCommonErrorCatalogEntryByStatus(404)).toEqual({
      code: 'COMMON-404',
      status: 404,
      message: '리소스를 찾을 수 없습니다',
    })
    expect(getCommonErrorCatalogEntryByStatus(502)).toBeUndefined()
  })
})
```

Create `apiError.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'

const response: ErrorResponse = {
  success: false,
  code: 'USER-001',
  message: 'server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/users',
  errors: [
    {
      field: 'nickname',
      rejectedValue: '하시',
      reason: 'duplicate',
    },
  ],
}

describe('ApiError', () => {
  it('preserves actual status, response fields, and cause', () => {
    const cause = new SyntaxError('invalid response')
    const error = new ApiError({ status: 409, response, cause })

    expect(error).toMatchObject({
      name: 'ApiError',
      message: 'server message',
      status: 409,
      response,
      cause,
      code: 'USER-001',
      fieldErrors: response.errors,
    })
  })

  it('supports status-only HTTP failures without inventing a server envelope', () => {
    const error = new ApiError({ status: 502 })

    expect(error.message).toBe('HTTP 502')
    expect(error.code).toBeUndefined()
    expect(error.response).toBeUndefined()
    expect(error.fieldErrors).toEqual([])
  })
})
```

- [x] **Step 2: Run Task 1 tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorCatalog.test.ts src/shared/api/apiError.test.ts
```

Expected: FAIL because `errorCatalog.ts` does not exist and the current `ApiError` constructor does not accept status/cause options.

- [x] **Step 3: Implement the complete catalog and status-preserving ApiError**

Create `errorCatalog.ts`:

```ts
export type ErrorCatalogEntry = {
  status: number
  message: string
}

export const ERROR_CATALOG = {
  'COMMON-400': { status: 400, message: '잘못된 요청입니다' },
  'COMMON-401': { status: 401, message: '인증이 필요합니다' },
  'COMMON-403': { status: 403, message: '권한이 없습니다' },
  'COMMON-404': { status: 404, message: '리소스를 찾을 수 없습니다' },
  'COMMON-405': {
    status: 405,
    message: '허용되지 않은 요청 메서드입니다',
  },
  'COMMON-409': {
    status: 409,
    message: '요청이 겹쳤습니다. 잠시 후 다시 시도해주세요',
  },
  'COMMON-415': { status: 415, message: '지원하지 않는 요청 형식입니다' },
  'COMMON-500': { status: 500, message: '서버 오류입니다' },
  'AUTH-001': { status: 401, message: '유효하지 않은 토큰입니다' },
  'AUTH-002': { status: 401, message: '만료된 토큰입니다' },
  'AUTH-003': {
    status: 401,
    message: '리프레시 토큰이 존재하지 않습니다',
  },
  'AUTH-004': {
    status: 401,
    message: '이미 사용된 토큰입니다. 다시 로그인해주세요',
  },
  'AUTH-005': { status: 401, message: '카카오 인증에 실패했습니다' },
  'AUTH-006': {
    status: 401,
    message: '유효하지 않은 온보딩 토큰입니다',
  },
  'AUTH-007': {
    status: 502,
    message: '카카오 서버와 통신할 수 없습니다',
  },
  'AUTH-008': { status: 409, message: '이미 가입된 소셜 계정입니다' },
  'AUTH-009': {
    status: 401,
    message: '아이디 또는 비밀번호가 올바르지 않습니다',
  },
  'USER-001': { status: 409, message: '중복된 닉네임입니다' },
  'USER-002': { status: 409, message: '이미 사용 중인 이메일입니다' },
  'USER-003': { status: 409, message: '이미 사용 중인 연락처입니다' },
  'USER-004': { status: 409, message: '이미 사용 중인 가입 정보입니다' },
  'USER-005': { status: 404, message: '회원을 찾을 수 없습니다' },
  'RESTAURANT-001': {
    status: 400,
    message: '지원하지 않는 음식 장르입니다.',
  },
  'RESTAURANT-002': {
    status: 400,
    message: '지원하지 않는 정렬 기준입니다.',
  },
  'RESTAURANT-003': {
    status: 400,
    message: '지원하지 않는 식당 목록 유형입니다.',
  },
  'RESTAURANT-004': {
    status: 404,
    message: '식당을 찾을 수 없습니다.',
  },
  'RESTAURANT-005': {
    status: 400,
    message: '지원하지 않는 큐레이션 유형입니다.',
  },
  'RESTAURANT-006': {
    status: 400,
    message:
      '영업시간 정보가 올바르지 않습니다. 모든 요일을 중복 없이 포함하고 시간 규칙을 지켜야 합니다.',
  },
  'RESERVATION-001': { status: 404, message: '예약을 찾을 수 없습니다' },
  'RESERVATION-002': {
    status: 404,
    message: '예약하려는 식당을 찾을 수 없습니다',
  },
  'RESERVATION-003': {
    status: 400,
    message: '사용 포인트가 결제 수수료를 초과했습니다',
  },
  'RESERVATION-004': { status: 409, message: '이미 취소된 예약입니다' },
  'RESERVATION-005': {
    status: 409,
    message: '취소할 수 없는 상태의 예약입니다',
  },
  'RESERVATION-006': {
    status: 400,
    message: '결제 금액이 수수료 계산과 일치하지 않습니다',
  },
  'RESERVATION-007': {
    status: 404,
    message: '예약자를 찾을 수 없습니다',
  },
  'REVIEW-001': {
    status: 409,
    message: '이미 리뷰를 작성한 예약입니다.',
  },
  'REVIEW-002': {
    status: 409,
    message: '방문 완료된 예약만 리뷰를 작성할 수 있습니다.',
  },
  'REVIEW-003': {
    status: 400,
    message: '지원하지 않는 리뷰 상태입니다.',
  },
  'REVIEW-004': {
    status: 400,
    message: '지원하지 않는 리뷰 정렬 기준입니다.',
  },
  'REVIEW-005': {
    status: 400,
    message: '지원하지 않는 리뷰 키워드입니다.',
  },
  'REVIEW-006': { status: 404, message: '리뷰를 찾을 수 없습니다.' },
  'REVIEW-007': {
    status: 409,
    message: '등록 식당 예약만 리뷰를 작성할 수 있습니다.',
  },
  'POINT-001': { status: 400, message: '보유 포인트가 부족합니다' },
  'POINT-002': {
    status: 400,
    message: '포인트 금액은 1 이상이어야 합니다',
  },
  'POINT-003': {
    status: 404,
    message: '복원할 포인트 사용 내역을 찾을 수 없습니다',
  },
  'POINT-004': {
    status: 409,
    message: '이미 복원된 포인트 사용 내역입니다',
  },
  'UPLOAD-001': {
    status: 400,
    message: '지원하지 않는 파일 사용 목적입니다.',
  },
  'UPLOAD-002': {
    status: 400,
    message: '지원하지 않는 파일 형식입니다.',
  },
  'UPLOAD-003': {
    status: 400,
    message: '업로드 가능한 파일 크기를 초과했습니다.',
  },
  'MAGAZINE-001': { status: 404, message: '매거진을 찾을 수 없습니다.' },
} as const satisfies Record<string, ErrorCatalogEntry>

export type KnownApiErrorCode = keyof typeof ERROR_CATALOG

const COMMON_ERROR_CODE_BY_STATUS = {
  400: 'COMMON-400',
  401: 'COMMON-401',
  403: 'COMMON-403',
  404: 'COMMON-404',
  405: 'COMMON-405',
  409: 'COMMON-409',
  415: 'COMMON-415',
  500: 'COMMON-500',
} as const satisfies Partial<Record<number, KnownApiErrorCode>>

export const checkIsKnownApiErrorCode = (
  code: string,
): code is KnownApiErrorCode => Object.hasOwn(ERROR_CATALOG, code)

export const getErrorCatalogEntry = (code: string) => {
  if (!checkIsKnownApiErrorCode(code)) {
    return undefined
  }

  return { code, ...ERROR_CATALOG[code] }
}

export const getCommonErrorCatalogEntryByStatus = (status: number) => {
  const code =
    COMMON_ERROR_CODE_BY_STATUS[
      status as keyof typeof COMMON_ERROR_CODE_BY_STATUS
    ]

  return code ? { code, ...ERROR_CATALOG[code] } : undefined
}
```

Replace `apiError.ts` with:

```ts
import type { ErrorResponse, FieldError } from '@/shared/api/types'

export interface ApiErrorOptions {
  status: number
  response?: ErrorResponse
  cause?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly response?: ErrorResponse

  constructor({ status, response, cause }: ApiErrorOptions) {
    super(response?.message ?? `HTTP ${status}`, { cause })
    this.name = 'ApiError'
    this.status = status
    this.response = response
  }

  get code(): string | undefined {
    return this.response?.code
  }

  get fieldErrors(): FieldError[] {
    return this.response?.errors ?? []
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError
```

- [x] **Step 4: Run catalog and ApiError tests and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorCatalog.test.ts src/shared/api/apiError.test.ts
```

Expected: PASS with 50 catalog keys and both `ApiError` cases green.

- [x] **Step 5: Write failing presentation-priority tests**

Create `errorPresentation.test.ts`:

```ts
import { NetworkError, TimeoutError } from 'ky'
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import {
  DEFAULT_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  getErrorPresentation,
} from '@/shared/api/errorPresentation'
import type { ErrorResponse } from '@/shared/api/types'

const createResponse = (code: string): ErrorResponse => ({
  success: false,
  code,
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/test',
})

describe('getErrorPresentation', () => {
  it('prefers known external code copy over raw server copy', () => {
    const error = new ApiError({
      status: 409,
      response: createResponse('USER-001'),
    })

    expect(getErrorPresentation(error)).toEqual({
      code: 'USER-001',
      message: '중복된 닉네임입니다',
    })
  })

  it('falls back to the common HTTP status for an unknown envelope code', () => {
    const error = new ApiError({
      status: 404,
      response: createResponse('FUTURE-404'),
    })

    expect(getErrorPresentation(error)).toEqual({
      code: 'COMMON-404',
      message: '리소스를 찾을 수 없습니다',
    })
  })

  it('maps timeout and network errors without exposing raw messages', () => {
    const request = new Request('https://api.hashi.test')

    expect(getErrorPresentation(new TimeoutError(request))).toEqual({
      message: TIMEOUT_ERROR_MESSAGE,
    })
    expect(getErrorPresentation(new NetworkError(request))).toEqual({
      message: NETWORK_ERROR_MESSAGE,
    })
  })

  it('uses generic copy for unknown errors and unmapped statuses', () => {
    expect(getErrorPresentation(new Error('secret detail'))).toEqual({
      message: DEFAULT_ERROR_MESSAGE,
    })
    expect(getErrorPresentation(new ApiError({ status: 502 }))).toEqual({
      message: DEFAULT_ERROR_MESSAGE,
    })
  })
})
```

- [x] **Step 6: Run presentation tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorPresentation.test.ts
```

Expected: FAIL because `errorPresentation.ts` does not exist.

- [x] **Step 7: Implement presentation resolution and public exports**

Create `errorPresentation.ts`:

```ts
import { isNetworkError, isTimeoutError } from 'ky'

import { isApiError } from '@/shared/api/apiError'
import {
  getCommonErrorCatalogEntryByStatus,
  getErrorCatalogEntry,
} from '@/shared/api/errorCatalog'

export const DEFAULT_ERROR_MESSAGE =
  '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
export const NETWORK_ERROR_MESSAGE =
  '네트워크 연결을 확인한 후 다시 시도해주세요.'
export const TIMEOUT_ERROR_MESSAGE =
  '요청 시간이 초과되었습니다. 다시 시도해주세요.'

export interface ErrorPresentation {
  code?: string
  message: string
}

export const getErrorPresentation = (error: unknown): ErrorPresentation => {
  if (isApiError(error)) {
    const codeEntry = error.code ? getErrorCatalogEntry(error.code) : undefined

    if (codeEntry) {
      return { code: codeEntry.code, message: codeEntry.message }
    }

    const statusEntry = getCommonErrorCatalogEntryByStatus(error.status)

    if (statusEntry) {
      return { code: statusEntry.code, message: statusEntry.message }
    }

    return { message: DEFAULT_ERROR_MESSAGE }
  }

  if (isTimeoutError(error)) {
    return { message: TIMEOUT_ERROR_MESSAGE }
  }

  if (isNetworkError(error)) {
    return { message: NETWORK_ERROR_MESSAGE }
  }

  return { message: DEFAULT_ERROR_MESSAGE }
}
```

Replace the current `ApiError` export and make the leading block of
`shared/api/index.ts`:

```ts
export { ApiError, isApiError, type ApiErrorOptions } from './apiError'
export {
  ERROR_CATALOG,
  checkIsKnownApiErrorCode,
  getCommonErrorCatalogEntryByStatus,
  getErrorCatalogEntry,
  type ErrorCatalogEntry,
  type KnownApiErrorCode,
} from './errorCatalog'
export {
  DEFAULT_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  getErrorPresentation,
  type ErrorPresentation,
} from './errorPresentation'
```

Keep the existing `apiClient`, `request`, and response-type exports below these lines.

- [x] **Step 8: Run all Task 1 tests and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorCatalog.test.ts src/shared/api/apiError.test.ts src/shared/api/errorPresentation.test.ts
```

Expected: PASS with zero warnings or unhandled errors.

- [x] **Step 9: Commit Task 1**

Run:

```bash
git add apps/client/src/shared/api/apiError.ts apps/client/src/shared/api/apiError.test.ts apps/client/src/shared/api/errorCatalog.ts apps/client/src/shared/api/errorCatalog.test.ts apps/client/src/shared/api/errorPresentation.ts apps/client/src/shared/api/errorPresentation.test.ts apps/client/src/shared/api/index.ts
git commit -m "feat(apps/client): HASHI-104 서버 오류 정규화"
```

Expected: the commit excludes `useAuthStatus.ts` and contains only Task 1 files.

---

### Task 2: Defensive response parsing and actual status preservation

**Files:**

- Modify: `apps/client/src/shared/api/types.ts`
- Modify: `apps/client/src/shared/api/request.ts`
- Modify: `apps/client/src/shared/api/request.test.ts`

**Interfaces:**

- Consumes: `ApiError({ status, response, cause })`, backend success/error envelopes.
- Produces: runtime-safe `isSuccessResponse`, runtime-safe `isErrorResponse`, status-aware `request<TData>()` failures.

- [x] **Step 1: Extend request tests with status and malformed-body cases**

Change the `createHttpResponse` helper in `request.test.ts` to:

```ts
const createHttpResponse = ({
  ok,
  status,
  body,
  jsonError,
}: {
  ok: boolean
  status: number
  body?: unknown
  jsonError?: unknown
}) => ({
  ok,
  status,
  json: () =>
    jsonError === undefined ? Promise.resolve(body) : Promise.reject(jsonError),
})
```

Update the existing 400 and 500 expectations so they also assert `status`.
Replace the final 500 assertion with:

```ts
await expect(request('users')).rejects.toMatchObject({
  name: 'ApiError',
  status: 500,
  code: 'COMMON-500',
  response: serverError,
})
```

Add these tests:

```ts
it('normalizes a non-JSON HTTP failure with its actual status', async () => {
  const parseError = new SyntaxError('Unexpected token <')
  mockedApiClient.mockResolvedValue(
    createHttpResponse({
      ok: false,
      status: 502,
      jsonError: parseError,
    }) as never,
  )

  await expect(request('users')).rejects.toMatchObject({
    name: 'ApiError',
    message: 'HTTP 502',
    status: 502,
    cause: parseError,
  })
})

it('normalizes a malformed parsed HTTP failure without trusting its body', async () => {
  const malformedBody = { error: 'proxy detail' }
  mockedApiClient.mockResolvedValue(
    createHttpResponse({
      ok: false,
      status: 500,
      body: malformedBody,
    }) as never,
  )

  await expect(request('users')).rejects.toMatchObject({
    name: 'ApiError',
    message: 'HTTP 500',
    status: 500,
    cause: malformedBody,
  })
})

it('rejects a malformed success response as a contract error', async () => {
  const malformedBody = { success: true, message: 'missing data and code' }
  mockedApiClient.mockResolvedValue(
    createHttpResponse({
      ok: true,
      status: 200,
      body: malformedBody,
    }) as never,
  )

  await expect(request('users')).rejects.toMatchObject({
    name: 'Error',
    message: 'Invalid API response',
    cause: malformedBody,
  })
})
```

- [x] **Step 2: Run request tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/request.test.ts
```

Expected: FAIL because current `request` loses status, throws JSON parse errors directly, and accepts malformed success data through a compile-time cast.

- [x] **Step 3: Implement runtime envelope guards**

Replace the guard section in `types.ts` with:

```ts
const checkIsRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const checkIsFieldError = (value: unknown): value is FieldError =>
  checkIsRecord(value) &&
  typeof value.field === 'string' &&
  typeof value.reason === 'string' &&
  'rejectedValue' in value

export const isSuccessResponse = <TData>(
  response: unknown,
): response is SuccessResponse<TData> =>
  checkIsRecord(response) &&
  response.success === true &&
  typeof response.code === 'string' &&
  typeof response.message === 'string' &&
  'data' in response &&
  response.data !== undefined

export const isErrorResponse = (response: unknown): response is ErrorResponse =>
  checkIsRecord(response) &&
  response.success === false &&
  typeof response.code === 'string' &&
  typeof response.message === 'string' &&
  response.data === null &&
  typeof response.timestamp === 'string' &&
  typeof response.path === 'string' &&
  (response.errors === undefined ||
    (Array.isArray(response.errors) &&
      response.errors.every(checkIsFieldError)))
```

Keep `ApiResponse<TData>` exported for endpoint typing even though `request`
now validates an `unknown` runtime value.

- [x] **Step 4: Implement defensive request parsing**

Replace `request.ts` with:

```ts
import type { Options } from 'ky'

import { ApiError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

const parseResponseBody = async (httpResponse: Response): Promise<unknown> => {
  try {
    return await httpResponse.json()
  } catch (cause) {
    if (!httpResponse.ok) {
      throw new ApiError({ status: httpResponse.status, cause })
    }

    throw new Error('Invalid API response', { cause })
  }
}

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | null> => {
  const normalizedPath = normalizePath(path)
  const httpResponse = await apiClient(normalizedPath, options)
  const response = await parseResponseBody(httpResponse)

  if (isErrorResponse(response)) {
    throw new ApiError({ status: httpResponse.status, response })
  }

  if (!httpResponse.ok) {
    throw new ApiError({ status: httpResponse.status, cause: response })
  }

  if (!isSuccessResponse<TData>(response)) {
    throw new Error('Invalid API response', { cause: response })
  }

  return response.data
}
```

- [x] **Step 5: Run request tests and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/request.test.ts
```

Expected: PASS for existing success/error cases and all three new malformed-response cases.

- [x] **Step 6: Run all shared API tests**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api
```

Expected: PASS with zero failures and no unhandled rejection.

- [x] **Step 7: Commit Task 2**

Run:

```bash
git add apps/client/src/shared/api/types.ts apps/client/src/shared/api/request.ts apps/client/src/shared/api/request.test.ts
git commit -m "feat(apps/client): HASHI-104 HTTP 오류 응답 보강"
```

Expected: the commit contains only Task 2 files and leaves `useAuthStatus.ts` unstaged.

---

### Task 3: Contextual TanStack Query and mutation policy

**Files:**

- Create: `apps/client/src/shared/api/errorPolicy.test.ts`
- Create: `apps/client/src/shared/api/errorPolicy.ts`
- Create: `apps/client/src/shared/lib/queryClient.test.ts`
- Modify: `apps/client/src/shared/lib/queryClient.ts`
- Create: `apps/client/src/pages/search/hooks/useSearchRestaurantsQuery.test.tsx`
- Modify: `apps/client/src/pages/search/hooks/useSearchRestaurantsQuery.ts`

**Interfaces:**

- Consumes: status-aware `ApiError`, ky `NetworkError`/`TimeoutError`, `getErrorPresentation`, HDS `showToast`, Sentry.
- Produces: `checkShouldRetryQuery`, `checkShouldThrowQueryError`, `checkIsExpectedRequestError`, `createQueryClient`; local search-query opt-out.

- [x] **Step 1: Write failing pure policy tests**

Create `errorPolicy.test.ts`:

```ts
import { NetworkError, TimeoutError } from 'ky'
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import {
  checkIsExpectedRequestError,
  checkShouldRetryQuery,
  checkShouldThrowQueryError,
} from '@/shared/api/errorPolicy'

describe('query error policy', () => {
  it('retries 5xx, network, and timeout once', () => {
    const request = new Request('https://api.hashi.test')
    const retryableErrors = [
      new ApiError({ status: 500 }),
      new ApiError({ status: 502 }),
      new NetworkError(request),
      new TimeoutError(request),
    ]

    retryableErrors.forEach((error) => {
      expect(checkShouldRetryQuery(0, error)).toBe(true)
      expect(checkShouldRetryQuery(1, error)).toBe(false)
    })
  })

  it('does not retry expected 4xx or unexpected client errors', () => {
    expect(checkShouldRetryQuery(0, new ApiError({ status: 409 }))).toBe(false)
    expect(checkShouldRetryQuery(0, new Error('render bug'))).toBe(false)
  })

  it('throws fatal query errors to a boundary but keeps 4xx local', () => {
    expect(checkShouldThrowQueryError(new ApiError({ status: 400 }))).toBe(
      false,
    )
    expect(checkShouldThrowQueryError(new ApiError({ status: 500 }))).toBe(true)
    expect(checkShouldThrowQueryError(new Error('render bug'))).toBe(true)
  })

  it('classifies API and transport failures as expected request errors', () => {
    const request = new Request('https://api.hashi.test')

    expect(checkIsExpectedRequestError(new ApiError({ status: 400 }))).toBe(
      true,
    )
    expect(checkIsExpectedRequestError(new NetworkError(request))).toBe(true)
    expect(checkIsExpectedRequestError(new TimeoutError(request))).toBe(true)
    expect(checkIsExpectedRequestError(new Error('render bug'))).toBe(false)
  })
})
```

- [x] **Step 2: Run policy tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorPolicy.test.ts
```

Expected: FAIL because `errorPolicy.ts` does not exist.

- [x] **Step 3: Implement pure policy functions**

Create `errorPolicy.ts`:

```ts
import { isNetworkError, isTimeoutError } from 'ky'

import { isApiError } from '@/shared/api/apiError'

const MAX_QUERY_RETRY_COUNT = 1

export const checkIsExpectedRequestError = (error: unknown) =>
  isApiError(error) || isNetworkError(error) || isTimeoutError(error)

export const checkShouldRetryQuery = (failureCount: number, error: Error) => {
  if (failureCount >= MAX_QUERY_RETRY_COUNT) {
    return false
  }

  if (isApiError(error)) {
    return error.status >= 500
  }

  return isNetworkError(error) || isTimeoutError(error)
}

export const checkShouldThrowQueryError = (error: Error) => {
  if (isApiError(error)) {
    return error.status >= 500
  }

  return true
}
```

- [x] **Step 4: Run policy tests and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorPolicy.test.ts
```

Expected: PASS for retry, throw, and expected-error classification.

- [x] **Step 5: Write failing QueryClient mutation fallback tests**

Create `queryClient.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/shared/api/apiError'
import { createQueryClient } from '@/shared/lib/queryClient'
import type { ErrorResponse } from '@/shared/api/types'

const { mockCaptureException, mockShowToast } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
  mockShowToast: vi.fn(),
}))

vi.mock('@hashi/hds-ui', () => ({
  showToast: mockShowToast,
}))

vi.mock('@sentry/react', () => ({
  captureException: mockCaptureException,
}))

const response: ErrorResponse = {
  success: false,
  code: 'RESERVATION-004',
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/reservations/1/cancel',
}

const callDefaultMutationOnError = (error: Error) => {
  const onError = createQueryClient().getDefaultOptions().mutations?.onError as
    | ((nextError: Error) => void)
    | undefined

  expect(onError).toBeTypeOf('function')
  onError?.(error)
}

describe('queryClient mutation errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows catalog copy without throwing an expected API error', () => {
    callDefaultMutationOnError(new ApiError({ status: 409, response }))

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '이미 취소된 예약입니다',
    })
    expect(mockCaptureException).not.toHaveBeenCalled()
  })

  it('shows generic copy and captures an unexpected mutation error', () => {
    const error = new Error('unexpected mutation bug')

    callDefaultMutationOnError(error)

    expect(mockShowToast).toHaveBeenCalledWith({
      children: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    })
    expect(mockCaptureException).toHaveBeenCalledWith(error)
  })
})
```

- [x] **Step 6: Run QueryClient tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/lib/queryClient.test.ts
```

Expected: FAIL because `createQueryClient` and the mutation fallback handler do not exist.

- [x] **Step 7: Wire policies and mutation toast into QueryClient**

Replace `queryClient.ts` with:

```ts
import { showToast } from '@hashi/hds-ui'
import * as Sentry from '@sentry/react'
import { QueryClient } from '@tanstack/react-query'

import { getErrorPresentation } from '@/shared/api/errorPresentation'
import {
  checkIsExpectedRequestError,
  checkShouldRetryQuery,
  checkShouldThrowQueryError,
} from '@/shared/api/errorPolicy'

const handleMutationError = (error: Error) => {
  if (!checkIsExpectedRequestError(error)) {
    Sentry.captureException(error)
  }

  const { message } = getErrorPresentation(error)
  showToast({ children: message })
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 10 * 60 * 1_000,
        refetchOnWindowFocus: false,
        retry: checkShouldRetryQuery,
        staleTime: 30_000,
        throwOnError: checkShouldThrowQueryError,
      },
      mutations: {
        onError: handleMutationError,
        retry: false,
        throwOnError: false,
      },
    },
  })

export const queryClient = createQueryClient()
```

- [x] **Step 8: Run policy and QueryClient tests and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorPolicy.test.ts src/shared/lib/queryClient.test.ts
```

Expected: PASS with the API mutation using catalog copy and the unexpected mutation captured once.

- [x] **Step 9: Write a failing local-search regression test**

Create `useSearchRestaurantsQuery.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useSearchRestaurantsQuery } from '@/pages/search/hooks/useSearchRestaurantsQuery'

const { mockSearchRestaurants } = vi.hoisted(() => ({
  mockSearchRestaurants: vi.fn(),
}))

vi.mock('@/pages/search/api/searchRestaurants', () => ({
  searchRestaurants: mockSearchRestaurants,
}))

const SearchQueryProbe = () => {
  const query = useSearchRestaurantsQuery({
    category: 'all',
    keyword: '라멘',
    sort: 'default',
  })

  if (query.isError) {
    return <p>local search error</p>
  }

  return <p>{query.status}</p>
}

describe('useSearchRestaurantsQuery', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('keeps its error local even when the app default throws query errors', async () => {
    mockSearchRestaurants.mockRejectedValue(new Error('search failed'))
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          throwOnError: true,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<p>query boundary</p>}>
          <SearchQueryProbe />
        </ErrorBoundary>
      </QueryClientProvider>,
    )

    expect(await screen.findByText('local search error')).toBeInTheDocument()
    expect(screen.queryByText('query boundary')).not.toBeInTheDocument()
  })
})
```

- [x] **Step 10: Run the search regression test and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/pages/search/hooks/useSearchRestaurantsQuery.test.tsx
```

Expected: FAIL by rendering `query boundary`, because the hook inherits the app-level throw policy.

- [x] **Step 11: Keep search errors local and verify GREEN**

Add this option to the existing `useQuery` call in
`useSearchRestaurantsQuery.ts`:

```ts
throwOnError: false,
```

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/pages/search/hooks/useSearchRestaurantsQuery.test.tsx
```

Expected: PASS with `local search error` rendered and no boundary fallback.

- [x] **Step 12: Run focused Task 3 verification**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/shared/api/errorPolicy.test.ts src/shared/lib/queryClient.test.ts src/pages/search/hooks/useSearchRestaurantsQuery.test.tsx
pnpm --filter @hashi/client typecheck
```

Expected: both commands exit `0` with no type errors or test failures.

- [x] **Step 13: Commit Task 3**

Run:

```bash
git add apps/client/src/shared/api/errorPolicy.ts apps/client/src/shared/api/errorPolicy.test.ts apps/client/src/shared/lib/queryClient.ts apps/client/src/shared/lib/queryClient.test.ts apps/client/src/pages/search/hooks/useSearchRestaurantsQuery.ts apps/client/src/pages/search/hooks/useSearchRestaurantsQuery.test.tsx
git commit -m "feat(apps/client): HASHI-104 쿼리 오류 정책 적용"
```

Expected: only Task 3 files are committed; `useAuthStatus.ts` remains unstaged.

---

### Task 4: Router-local async boundary, fallback UI, reset, and Sentry

**Files:**

- Create: `apps/client/src/app/providers/AsyncErrorFallback.tsx`
- Create: `apps/client/src/app/providers/AsyncBoundary.test.tsx`
- Modify: `apps/client/src/app/providers/AsyncBoundary.tsx`
- Modify: `apps/client/src/app/providers/QueryProvider.tsx`
- Modify: `apps/client/src/app/layout/RootLayout.tsx`
- Modify: `apps/client/src/app/layout/RootLayout.test.tsx`

**Interfaces:**

- Consumes: `getErrorPresentation`, `QueryErrorResetBoundary`, `ErrorBoundary`, HDS `Button`, Sentry, React Router `Outlet`.
- Produces: route-content fallback with `role="alert"`, optional known code, mapped message, one retry button, query reset, Sentry capture.

- [x] **Step 1: Write a failing boundary retry integration test**

Create `AsyncBoundary.test.tsx`:

```tsx
import '@testing-library/jest-dom/vitest'

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AsyncBoundary from '@/app/providers/AsyncBoundary'
import { ApiError } from '@/shared/api/apiError'
import type { ErrorResponse } from '@/shared/api/types'

const { mockCaptureException } = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
}))

vi.mock('@sentry/react', () => ({
  captureException: mockCaptureException,
}))

const response: ErrorResponse = {
  success: false,
  code: 'COMMON-500',
  message: 'raw server message',
  data: null,
  timestamp: '2026-07-11T00:00:00.000Z',
  path: '/api/v1/restaurants',
}

const QueryContent = ({ queryFn }: { queryFn: () => Promise<string> }) => {
  const { data } = useQuery({
    queryKey: ['async-boundary-test'],
    queryFn,
  })

  return <p>{data}</p>
}

describe('AsyncBoundary', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows mapped copy, captures the error, and refetches after reset', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    const error = new ApiError({ status: 500, response })
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('recovered')
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          throwOnError: true,
        },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <AsyncBoundary>
          <QueryContent queryFn={queryFn} />
        </AsyncBoundary>
      </QueryClientProvider>,
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('COMMON-500')
    expect(alert).toHaveTextContent('서버 오류입니다')
    expect(mockCaptureException).toHaveBeenCalledWith(error, {
      extra: { componentStack: expect.any(String) },
    })

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByText('recovered')).toBeInTheDocument()
    expect(queryFn).toHaveBeenCalledTimes(2)
  })
})
```

- [x] **Step 2: Run boundary test and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/app/providers/AsyncBoundary.test.tsx
```

Expected: FAIL because the current fallback ignores the error, displays generic copy only, and does not capture through Sentry.

- [x] **Step 3: Implement the dedicated fallback and Sentry capture**

Create `AsyncErrorFallback.tsx`:

```tsx
import { Button } from '@hashi/hds-ui'
import type { FallbackProps } from 'react-error-boundary'

import { getErrorPresentation } from '@/shared/api/errorPresentation'

export const AsyncErrorFallback = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const { code, message } = getErrorPresentation(error)

  return (
    <section
      className="flex min-h-dvh flex-col items-center justify-center px-5 text-center"
      role="alert"
    >
      {code ? (
        <p className="typo-caption-1 text-cool-gray-500 mb-2">{code}</p>
      ) : null}
      <p className="typo-header-3 text-primary-200 whitespace-pre-line">
        {message}
      </p>
      <Button
        className="mt-6 w-59.25"
        onClick={resetErrorBoundary}
        size="md"
        type="button"
      >
        다시 시도
      </Button>
    </section>
  )
}
```

Replace `AsyncBoundary.tsx` with:

```tsx
import * as Sentry from '@sentry/react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AsyncErrorFallback } from '@/app/providers/AsyncErrorFallback'

interface AsyncBoundaryProps {
  children: ReactNode
}

const handleBoundaryError = (error: unknown, info: ErrorInfo) => {
  Sentry.captureException(error, {
    extra: { componentStack: info.componentStack },
  })
}

const AsyncBoundary = ({ children }: AsyncBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={AsyncErrorFallback}
          onError={handleBoundaryError}
          onReset={reset}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default AsyncBoundary
```

- [x] **Step 4: Run boundary test and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/app/providers/AsyncBoundary.test.tsx
```

Expected: PASS; the test observes mapped copy, one Sentry capture, reset, and a second successful query call.

- [x] **Step 5: Write a failing RootLayout ownership test**

In `RootLayout.test.tsx`, add `ReactNode` as a type import and extend the hoisted mocks:

```tsx
const { mockAsyncBoundary, mockToastRegion } = vi.hoisted(() => ({
  mockAsyncBoundary: vi.fn(({ children }: { children: ReactNode }) => (
    <div data-testid="async-boundary">{children}</div>
  )),
  mockToastRegion: vi.fn(({ className }: { className?: string }) => (
    <div data-testid="toast-region" data-class-name={className} />
  )),
}))
```

Add this mock before the router mock:

```tsx
vi.mock('@/app/providers/AsyncBoundary', () => ({
  default: mockAsyncBoundary,
}))
```

Add this test:

```tsx
it('keeps route content inside AsyncBoundary and ToastRegion outside it', () => {
  render(<RootLayout />)

  const boundary = screen.getByTestId('async-boundary')
  const outlet = screen.getByTestId('route-outlet')
  const toastRegion = screen.getByTestId('toast-region')

  expect(boundary).toContainElement(outlet)
  expect(boundary).not.toContainElement(toastRegion)
})
```

- [x] **Step 6: Run RootLayout tests and verify RED**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/app/layout/RootLayout.test.tsx
```

Expected: FAIL because `RootLayout` does not render `AsyncBoundary`.

- [x] **Step 7: Move AsyncBoundary below Router and preserve ToastRegion**

Remove the `AsyncBoundary` import and wrapper from `QueryProvider.tsx` so its
provider body becomes:

```tsx
return (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
```

Import `AsyncBoundary` in `RootLayout.tsx` and wrap only the outlet:

```tsx
<main className="app-mobile-frame min-h-dvh bg-white">
  <AsyncBoundary>
    <Outlet />
  </AsyncBoundary>
</main>
<ToastRegion className="z-toast fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] px-5 pt-[calc(32px+var(--safe-area-top,0px))]" />
```

- [x] **Step 8: Run layout and boundary tests and verify GREEN**

Run:

```bash
pnpm --filter @hashi/client exec vitest run src/app/providers/AsyncBoundary.test.tsx src/app/layout/RootLayout.test.tsx
```

Expected: PASS with the outlet owned by the boundary and ToastRegion outside it.

- [x] **Step 9: Run focused Task 4 verification**

Run:

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client exec vitest run src/app/providers/AsyncBoundary.test.tsx src/app/layout/RootLayout.test.tsx
```

Expected: all commands exit `0` with no lint/type/test failures.

- [x] **Step 10: Commit Task 4**

Run:

```bash
git add apps/client/src/app/providers/AsyncErrorFallback.tsx apps/client/src/app/providers/AsyncBoundary.tsx apps/client/src/app/providers/AsyncBoundary.test.tsx apps/client/src/app/providers/QueryProvider.tsx apps/client/src/app/layout/RootLayout.tsx apps/client/src/app/layout/RootLayout.test.tsx
git commit -m "feat(apps/client): HASHI-104 에러 바운더리 연결"
```

Expected: only Task 4 files are committed; `useAuthStatus.ts` remains unstaged.

---

### Task 5: Data-layer documentation and full verification

**Files:**

- Modify: `docs/architecture/data-layer.md`
- Modify: `docs/superpowers/plans/2026-07-11-hashi-104-error-boundary.md`

**Interfaces:**

- Consumes: completed Tasks 1–4 and the approved HASHI-104 design.
- Produces: current data-layer source of truth and a checked implementation plan.

- [x] **Step 1: Update the data-layer error policy**

Add this section after `HTTP Client Boundary` in `data-layer.md`:

```markdown
## Error Handling Policy

`apps/client/src/shared/api`는 서버 error envelope와 실제 HTTP status를
`ApiError`로 정규화합니다.

- 외부 error code의 사용자 문구와 예상 status는 공통 error catalog에서 관리합니다.
- 실제 response status는 retry와 boundary 판단에 사용하며 catalog status로 덮어쓰지 않습니다.
- 미등록 code와 비JSON/malformed error body는 원본 정보를 진단용으로 보존하되, 사용자에게 임의의 서버 message를 직접 노출하지 않습니다.
- query는 5xx, network, timeout만 1회 retry한 뒤 ErrorBoundary로 전달합니다.
- 예상 가능한 4xx query는 기본적으로 호출부의 local error state에 남깁니다.
- mutation은 retry하거나 render boundary로 throw하지 않고, 개별 `onError`가 없을 때 공통 toast를 fallback으로 사용합니다.
- page/form이 field error, NotFound, Forbidden, conflict UX를 소유하면 query/mutation option에서 전역 기본값을 명시적으로 override합니다.
- 인증 token refresh, request replay, logout은 error boundary가 아니라 별도 auth flow가 소유합니다.

route content용 `AsyncBoundary`는 `RootLayout` 내부에서 `Outlet`을 감싸며,
retry 시 React error state와 TanStack Query error state를 함께 reset합니다.
```

- [x] **Step 2: Mark completed plan checkboxes and run document checks**

Change each completed implementation checkbox in this plan from `- [ ]` to
`- [x]`, then run:

```bash
pnpm exec prettier --write docs/architecture/data-layer.md docs/superpowers/plans/2026-07-11-hashi-104-error-boundary.md
pnpm exec prettier --check docs/architecture/data-layer.md docs/superpowers/plans/2026-07-11-hashi-104-error-boundary.md
git diff --check
```

Expected: Prettier reports both documents formatted and `git diff --check` exits `0`.

- [x] **Step 3: Run the full client verification gate**

Run fresh commands:

```bash
pnpm --filter @hashi/client lint
pnpm --filter @hashi/client typecheck
pnpm --filter @hashi/client test
pnpm --filter @hashi/client build
pnpm format:check
```

Expected: every command exits `0`; Vitest reports zero failed tests and Vite completes the production build.

- [x] **Step 4: Run the API-integration audit**

Inspect the final diff and record these results:

```markdown
## API Integration Verification

Status: PASS

### Findings

No findings.

### Checks

- Endpoint boundary: PASS
- Query keys: PASS — no query key structure changed
- Query mode: PASS — search explicitly retains its local non-suspense error state
- Mutation invalidation: PASS — no endpoint mutation or invalidation changed
- UI states: PASS — fatal query fallback and mutation fallback toast are covered
- Docs sync: PASS

### Commands

- `pnpm --filter @hashi/client lint`: PASS
- `pnpm --filter @hashi/client typecheck`: PASS
- `pnpm --filter @hashi/client test`: PASS
- `pnpm --filter @hashi/client build`: PASS
- `pnpm format:check`: PASS
```

Expected: no boundary, query-mode, mutation, or docs-sync finding remains.

- [x] **Step 5: Verify the final diff excludes user work**

Run:

```bash
git status --short
git diff --name-only origin/develop...HEAD
git diff -- apps/client/src/shared/hooks/useAuthStatus.ts
```

Expected: `useAuthStatus.ts` remains an unstaged user-owned diff and does not
appear in any HASHI-104 commit. All other changed files trace to this plan.

- [x] **Step 6: Commit Task 5 documentation**

Run:

```bash
git add docs/architecture/data-layer.md docs/superpowers/plans/2026-07-11-hashi-104-error-boundary.md
git commit -m "docs(docs): HASHI-104 오류 처리 정책 문서화"
```

Expected: the documentation commit excludes `useAuthStatus.ts`, and the working tree contains only that preserved user diff.
