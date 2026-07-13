# Page Spec: `ProfileNewPage`

Jira: HASHI-120

## Purpose

- 카카오 간편 로그인 후 추가 정보가 필요한 신규 회원이 프로필 정보를 입력하고 온보딩을 완료할 수 있게 한다.
- 이번 범위는 프로필 생성 화면 UI, page-local form 상태, 입력값 formatting, field validation, `POST /api/v1/users/onboarding` API 연동, CTA 활성/비활성, 제출 후 다음 화면 이동까지 포함한다.
- 연락처 인증은 MVP 범위에서 제외하고, 연락처 값 입력과 숫자 normalization만 처리한다.
- 카카오 OAuth 신규 회원 응답으로 내려온 `signup_token`은 HttpOnly cookie로만 전달되며, 프론트는 직접 읽거나 저장하지 않는다.

## Route

- path: `/profile/new`
- path constant:
  - `ROUTES.profileNew`
- route owner:
  - `apps/client/src/app/router/routes.ts`
- layout:
  - `RootLayout`
  - bottom navigation layout 없음
- access type:
  - `authOnly`
- guard:
  - `AuthOnlyRoute`
- lazy loading:
  - `lazyPages.profileNew`
- bottom navigation:
  - no
- redirect:
  - unauthenticated: `ROUTES.loginRequired`
  - onboarding session: 접근 허용
  - authenticated guest: none
- auth status:
  - uses `useAuthStatus`: no, guard owns auth status

## Location

- page path:
  - `apps/client/src/pages/profileNew/ProfileNewPage.tsx`
- spec path:
  - `apps/client/src/pages/profileNew/ProfileNewPage.spec.md`
- route registration:
  - existing `apps/client/src/app/router/path.ts`
  - existing `apps/client/src/app/router/lazy.ts`
  - existing `apps/client/src/app/router/routes.ts`

## Requirements

- [ ] 상단에 `프로필 생성` 제목과 뒤로가기 버튼을 보여준다.
- [ ] 뒤로가기 버튼은 `navigate(-1)`을 실행한다.
- [ ] 화면 진입 시 기본 프로필 이미지를 보여준다.
- [ ] 기본 프로필 이미지는 `apps/client/src/shared/assets/images/profile-empty.svg`를 사용한다.
- [ ] 프로필 이미지 수정 버튼은 이미지 파일 선택을 연다.
- [ ] 사용자가 이미지를 선택하면 원형 preview로 표시한다.
- [ ] 이미지가 아닌 파일은 등록하지 않고 `이미지 파일만 등록해주세요.` 오류 문구를 표시한다.
- [ ] 5MB를 초과하는 프로필 이미지는 등록하지 않고 `5MB 이하의 이미지만 등록해주세요.` 오류 문구를 표시한다.
- [ ] `프로필 삭제` 버튼은 선택한 이미지를 제거하고 기본 프로필 이미지 상태로 되돌린다.
- [ ] 신규 프로필 생성 화면에서 `프로필 삭제`는 선택 파일 reset만 의미하며, 서버 이미지 삭제 의도를 draft에 담지 않는다.
- [ ] 프로필 이미지는 90px 원형으로 노출하고, 수정 아이콘은 `button_edit` 성격의 25px 아이콘을 사용한다.
- [ ] 프로필 이미지와 `프로필 삭제` 텍스트 사이 간격은 16px이고, 텍스트는 `Body3 / primary-200`을 사용한다.
- [ ] 닉네임 입력 필드를 보여준다.
- [ ] 닉네임은 필수값이며, 한 글자 입력할 때마다 실시간으로 중복 여부를 검증한다.
- [ ] 닉네임이 중복이면 필드 아래에 `중복된 네이밍입니다.`를 `Body3 / error` 문구로 표시한다.
- [ ] 생년월일 입력 필드를 보여준다.
- [ ] 생년월일은 필수값이며, 숫자 8자리를 `YYYYMMDD` 원본 값으로 관리한다.
- [ ] 생년월일은 사용자가 입력하는 동안 `YYYY/MM/DD` 형태로 표시한다.
- [ ] 생년월일이 숫자 8자리 실제 날짜가 아니면 필드 아래에 `생년월일을 정확히 입력해주세요.`를 빨간 오류 문구로 표시한다.
- [ ] 연락처 입력 필드를 보여준다.
- [ ] 연락처는 필수값이며, 숫자만 원본 값으로 관리한다.
- [ ] 연락처는 사용자가 입력하는 동안 전화번호 구간에 맞춰 hyphen(`-`)을 포함해 표시한다.
- [ ] 연락처 인증 UI, 인증번호 입력, 인증 API 호출은 이번 범위에서 제외한다.
- [ ] 영문 이름 입력 필드를 보여준다.
- [ ] 영문 이름은 선택값이다.
- [ ] 이메일 입력 필드를 보여준다.
- [ ] 이메일은 필수값이며 이메일 형식이 아니면 field error를 표시한다.
- [ ] 필수값과 validation이 모두 통과하지 않으면 하단 `완료` CTA를 비활성화한다.
- [ ] 활성화된 CTA 제출 시 form 값을 온보딩 API request body로 변환한다.
- [ ] 프로필 이미지가 선택되어 있으면 presigned URL을 발급받고 S3 업로드를 완료한 뒤 `fileKey`를 `profileImageKey`로 전송한다.
- [ ] 제출 중에는 CTA loading 또는 disabled 상태로 중복 submit을 막는다.
- [ ] 제출 성공 시 온보딩 이후 화면으로 이동한다.
- [ ] field error로 매핑 가능한 제출 실패는 해당 input 아래에 표시한다.
- [ ] field error로 매핑할 수 없는 예상 가능한 conflict는 form 하단에 사용자 메시지로 표시한다.
- [ ] 인증/권한/서버 오류는 route ErrorBoundary로 전파한다.

## Data Dependencies

### Query

- query:
  - 현재 확정 API 없음
  - 추후 닉네임 중복 확인 API로 교체 예정
- enabled condition:
  - API 연동 시 닉네임 `trim()` 결과가 1글자 이상이고 debounce가 끝났을 때 활성화한다.
- request params:
  - `nickname`
- loading state:
  - API 연동 시 입력은 유지하고, 중복 확인 결과가 확정될 때까지 CTA는 비활성화한다.
- error state:
  - API 연동 시 중복 확인 실패를 field-level error 또는 재시도 가능한 form error로 표시한다.
- empty state:
  - none
- refetch condition:
  - API 연동 시 닉네임 값이 변경되고 debounce가 끝날 때

### Mutation

- mutation:
  - `POST /api/v1/users/onboarding`
  - endpoint function: `apps/client/src/pages/profileNew/api/requestOnboarding.ts`
  - auth: `signup_token` HttpOnly cookie
  - accessToken, localStorage, sessionStorage, memory token을 직접 사용하지 않는다.
- profile image upload:
  - endpoint function: `apps/client/src/pages/profileNew/api/uploadProfileImage.ts`
  - `POST /api/v1/uploads/presigned-urls`
  - request usage: `profile`
  - response `uploadUrl`로 S3 `PUT` 업로드
  - response `fileKey`를 온보딩 API의 `profileImageKey`로 전달
- request data:
  - `nickname`: trimmed string
  - `birthDate`: `YYYYMMDD` 또는 `YYYY/MM/DD` 입력값을 `yyyy-MM-dd`로 변환
  - `phone`: 하이픈 제거 후 숫자만 전송
  - `email`: trimmed string
  - `nameEng`: optional, 빈 문자열이면 body에서 제외
  - `profileImageKey`: optional, presigned URL 업로드 완료 후 받은 S3 object key
- submit enabled condition:
  - 닉네임 `trim()` 결과가 1글자 이상
  - 닉네임 중복 확인이 성공 상태 또는 API 연동 전 local validation 통과 상태
  - 생년월일이 숫자 8자리 실제 날짜
  - 연락처가 지원하는 전화번호 길이와 숫자 형식
  - 이메일이 이메일 형식
  - 제출 중이 아님
- success handling:
  - `USER-201` 성공 응답의 `data.userId`가 number인지 검증한다.
  - `redirectTo` search param이 허용된 내부 경로이면 해당 경로로 이동한다.
  - 허용된 `redirectTo`에 query string 또는 hash가 포함되어 있으면 `pathname`만 allowlist 기준으로 검증하고, 실제 이동 시에는 query string과 hash를 보존한다.
  - `redirectTo`가 없으면 `ROUTES.home`으로 이동한다.
- failure handling:
  - `COMMON-400`의 `errors[]` 중 `nickname`, `birthDate`, `phone`, `email`은 field error로 표시한다.
  - `USER-001`은 nickname field error로 표시한다.
  - `USER-002`는 email field error로 표시한다.
  - `USER-003`은 phone field error로 표시한다.
  - `USER-004`는 form-level error로 표시한다.
  - `COMMON-401`, `COMMON-403`, `COMMON-500`, 업로드 실패, 계약 위반 응답은 ErrorBoundary로 전파한다.

## User Flow

1. 사용자가 카카오 간편 로그인 후 신규 회원으로 판정되면 `/profile/new`에 진입합니다.
2. 비회원이면 `AuthOnlyRoute`에 의해 `ROUTES.loginRequired`로 이동합니다.
3. onboarding session 또는 회원이면 프로필 생성 페이지를 렌더링합니다.
4. 사용자는 프로필 이미지를 선택하거나 기본 이미지를 유지합니다.
5. 사용자는 닉네임, 생년월일, 연락처, 이메일을 입력하고 필요하면 영문 이름을 입력합니다.
6. page-local hook이 입력값, formatting 값, validation, submit 가능 여부를 계산합니다.
7. 모든 필수 rule이 true이면 하단 `완료` CTA가 활성화됩니다.
8. 사용자가 활성화된 CTA를 누르면 form submit이 실행됩니다.
9. 프로필 이미지가 선택되어 있으면 presigned URL 발급과 S3 업로드를 먼저 수행합니다.
10. 온보딩 request body를 만들고 `POST /api/v1/users/onboarding`을 호출합니다.
11. 온보딩 API가 성공하면 온보딩 이후 화면으로 이동합니다.
12. 제출 실패 시 입력값을 유지하고 오류 메시지를 표시하거나 ErrorBoundary로 전파합니다.

## State

- local state:
  - selected profile image preview URL
  - selected profile image file
  - profile image deletion state, API payload 호환을 위해 유지하되 신규 생성 화면에서는 `false`
  - profile image file error message
  - form-level error message, API 연동 전에는 기본값 없음
  - owner: `useProfileNewForm`
- form state:
  - `nickname`
  - `birthDate`
  - `phoneNumber`
  - `englishName`
  - `email`
  - owner: `useProfileNewForm`
  - `react-hook-form`, `zod`는 이번 티켓에서 추가하지 않는다.
  - 추후 폼 표준화 시 `react-hook-form` + `zod resolver` 기반으로 validation, submit 가능 여부, payload 변환을 schema 중심으로 재검토한다.
- URL state:
  - optional `redirectTo` search param
  - 허용 경로:
    - `ROUTES.reviewNew`
    - `ROUTES.restaurantReservationNew`
    - `ROUTES.anywhereReservation`
    - `ROUTES.reservationRequest`
- server state:
  - profile image presigned URL response
  - onboarding mutation response
- derived state:
  - `formattedBirthDate`
  - `formattedPhoneNumber`
  - `fieldErrors`
  - `isNicknameValid`
  - `isBirthDateValid`
  - `isPhoneNumberValid`
  - `isEmailValid`
  - `canSubmit`
  - owner: `useProfileNewForm`

## Validation

- `nickname`
  - rule: `trim()` 결과가 1글자 이상, 중복 확인 통과
  - trigger: 입력값 변경 시마다 실시간 검증
  - error message: `중복된 네이밍입니다.`
- `birthDate`
  - rule: 숫자 8자리, 실제 날짜, 과거 날짜, submit 시 `yyyy-MM-dd`로 변환 가능
  - error message: `생년월일을 정확히 입력해주세요.`
- `phoneNumber`
  - rule: 숫자만 허용, normalization 이후 `^0\d{9,10}$`에 맞는 10~11자리
  - error message: `연락처를 정확히 입력해주세요.`
- `englishName`
  - rule: 선택값
  - error message: none
- `email`
  - rule: 이메일 형식
  - error message: `이메일을 정확히 입력해주세요.`
- submit enabled condition:
  - 모든 필수 rule이 true
  - 제출 중이 아님

## UI Structure

```text
ProfileNewPage
  useProfileNewPage
  FixedHeaderWrapper
    Header
      BackAction
      Title
  Form#PROFILE_NEW_FORM_ID
    ProfileImageSection
      Avatar
      ImageEditButton
      ProfileDeleteButton
      HiddenFileInput
    ProfileFields
      InputField: nickname
      FieldError
      InputField: birthDate
      FieldError
      InputField: phoneNumber
      FieldError
      InputField: englishName
      InputField: email
      FieldError
    FormError
  ProfileNewBottomBar
    CompleteButton
```

## Component Mapping

- HDS component:
  - `Header`
  - `IconButton`
  - `Avatar`
  - `InputField`
  - `Button`
- app shared component:
  - none
- app shared asset:
  - `profile-empty.svg`
- feature component:
  - none
- page-local component:
  - `ProfileImageSection`
  - `ProfileFields`
  - `ProfileNewBottomBar`
  - `FieldError`
- page-local hook:
  - `useProfileNewPage`
  - `useProfileNewForm`
- page-local mock:
  - `profileNew.mock.ts`
- page-local utils:
  - `formatBirthDateInput`
  - `formatPhoneNumberInput`
  - `checkIsValidBirthDate`
  - `checkIsValidEmail`
- page-local constants:
  - `PROFILE_NEW_FORM_ID`
- icon:
  - `BackIcon`
  - `PencilIcon`

## Error Handling

- API error:
  - `ApiError`의 `status`, `code`, `fieldErrors`를 기준으로 처리한다.
  - `COMMON-400` field errors는 서버 `reason`을 field error로 표시한다.
  - `USER-001`, `USER-002`, `USER-003`은 각각 닉네임, 이메일, 연락처 field error로 표시한다.
  - `USER-004`는 form-level error로 표시한다.
  - `COMMON-401`, `COMMON-403`, `COMMON-500`, 네트워크/타임아웃/업로드 실패는 route ErrorBoundary로 전파한다.
- validation error:
  - 닉네임 중복 오류는 입력값 변경 시마다 표시한다.
  - 생년월일, 연락처, 이메일 오류는 blur 이후 또는 submit 시도 이후 표시한다.
- exceptional case:
  - 파일 선택을 취소하면 기존 이미지 상태를 유지한다.
  - 이미지가 아닌 파일은 선택해도 preview로 반영하지 않고, 프로필 이미지 영역 근처에 오류를 표시한다.
  - 5MB를 초과하는 이미지는 선택해도 preview로 반영하지 않고, 프로필 이미지 영역 근처에 오류를 표시한다.
  - `accept="image/*"`는 브라우저 선택 UI 힌트로만 사용하고, handler에서 `file.type.startsWith('image/')`를 별도로 검증한다.
  - `redirectTo`에 query string 또는 hash가 붙어도 허용 여부는 `pathname` 기준으로 판단한다.
  - `redirectTo`가 외부 URL이거나 허용되지 않은 내부 경로이면 무시하고 `ROUTES.home`으로 이동한다.
- user-facing message:
  - field error는 해당 input 바로 아래 빨간 텍스트로 표시한다.
  - form-level error는 form 하단 또는 CTA 위 영역에 표시한다.
- retry or fallback:
  - 사용자가 값을 수정하면 관련 field error를 초기화하거나 재검증한다.
  - 프로필 생성 실패 후 사용자는 값을 유지한 채 다시 제출할 수 있다.

## Navigation

- entry:
  - 카카오 간편 로그인 완료 후 추가 정보 입력이 필요한 신규 회원 플로우
- links:
  - none
- route params:
  - none
- search params:
  - optional `redirectTo`
- success redirect:
  - allowed `redirectTo`
  - allowed `redirectTo`의 query string/hash 보존
  - fallback `ROUTES.home`
- failure redirect:
  - none
- back behavior:
  - `navigate(-1)`
- auth redirect:
  - unauthenticated users redirect to `ROUTES.loginRequired` through `AuthOnlyRoute`
  - new users with onboarding session can access `/profile/new`

## Styling

- Tailwind layout:
  - mobile-first, `RootLayout` mobile frame 기준
  - page root는 `min-h-dvh bg-white`를 사용한다.
  - header는 `app-mobile-fixed-top z-fixed bg-white` wrapper 안에서 모바일 프레임 상단에 고정한다.
  - HDS `Header`는 기본 position이 `relative`이므로 `app-mobile-fixed-top`을 `Header`에 직접 붙이지 않는다.
  - fixed header가 form을 덮지 않도록 form에 header height만큼 `pt-[75px]`를 둔다.
  - `ProfileSection`과 `FormSection` 사이는 28px 간격을 둔다.
  - form item 사이는 20px 간격을 둔다.
  - form label은 HDS `InputField`의 `SubHeader2 / Black`을 사용하고, label과 input 사이는 8px 간격을 둔다.
  - content 좌우 padding은 기존 예약 페이지 패턴처럼 page level에서 관리한다.
- responsive:
  - 앱 모바일 프레임 width를 따른다.
- fixed area:
  - 하단 CTA bar는 `app-mobile-fixed-bottom`
  - fixed 영역은 `z-fixed`를 사용한다.
  - 하단 padding은 `var(--safe-area-bottom,0px)`를 고려한다.
- scroll area:
  - 본문은 fixed bottom bar에 가리지 않도록 `pb-32` 하단 padding을 가진다.
  - 입력 필드와 오류 문구가 키보드에 가려지지 않는지 수동 확인한다.
- empty/loading/error layout:
  - field error가 나타나도 input 자체 width가 변하지 않는다.
  - CTA disabled 상태는 HDS `Button` disabled 스타일을 사용한다.
  - API 연동 시 CTA submitting 상태는 HDS `Button` loading 또는 disabled 상태를 사용한다.

## Implementation Notes

- `ProfileNewPage`는 화면 섹션 조합만 담당한다.
- `useProfileNewPage`는 navigation, search param, form submit 연결을 담당한다.
- form state, formatting, validation, submit draft 생성은 `useProfileNewForm`에서 소유한다.
- API 연동 전 임시 데이터는 `mocks/profileNew.mock.ts`에 둔다.
- `useProfileNewForm`은 form 값, formatting, validation, 서버 field error, submitting 상태를 소유한다.
- `useProfileNewPage`는 submit orchestration, profile image upload, onboarding API 호출, error mapping, navigation을 소유한다.
- `requestOnboarding`과 `uploadProfileImage`는 React, route, UI state를 알지 않는다.
- `signup_token`은 HttpOnly cookie이므로 프론트 코드에서 읽거나 저장하지 않는다.
- 온보딩 API 요청에 Authorization header를 임의로 추가하지 않는다.
- presigned URL의 `uploadUrl`은 S3 업로드에만 사용하고, 온보딩 API에는 `fileKey`만 `profileImageKey`로 보낸다.
- 하단 CTA는 기존 예약 페이지처럼 `form` attribute와 `PROFILE_NEW_FORM_ID`를 연결해 submit한다.
- `redirectTo`는 리뷰 작성/예약 플로우 복귀에 필요한 내부 route만 허용한다.
- page-local 컴포넌트 import는 `@/pages/profileNew/...` alias를 사용한다.
- HDS 컴포넌트에는 route, API, submit, tracking, 제품 검증 정책을 넣지 않는다.
- `InputField`는 error UI를 소유하지 않으므로 `FieldError`를 page-local로 둔다.
- 프로필 이미지 수정 버튼은 텍스트 없는 버튼이므로 `aria-label`을 제공한다.

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `git diff --check`
- [ ] `corepack pnpm --filter @hashi/client lint`
- [ ] `corepack pnpm --filter @hashi/client typecheck`
- [ ] `corepack pnpm --filter @hashi/client build`
- [ ] `corepack pnpm --filter @hashi/client test`
- [ ] `corepack pnpm --dir apps/client exec vitest run src/pages/profileNew`
- [ ] `/profile/new` route 접근 확인
- [ ] 비회원 접근 시 `ROUTES.loginRequired` redirect 확인
- [ ] bottom navigation layout 미포함 확인
- [ ] 뒤로가기 버튼 동작 확인
- [ ] 기본 프로필 이미지, 이미지 선택, 이미지 수정, 이미지 삭제 상태 확인
- [ ] 닉네임 중복 오류 표시 확인
- [ ] 생년월일 formatting과 오류 표시 확인
- [ ] 연락처 formatting과 오류 표시 확인
- [ ] 이메일 오류 표시 확인
- [ ] CTA disabled / enabled / submitting 상태 확인
- [ ] submit 성공 후 `redirectTo` 또는 `ROUTES.home` 이동 확인
- [ ] presigned URL 발급 후 S3 업로드, `profileImageKey` 전송 확인
- [ ] `COMMON-400`, `USER-001`, `USER-002`, `USER-003`, `USER-004` 처리 확인
- [ ] `COMMON-401`, `COMMON-403`, `COMMON-500` ErrorBoundary 전파 확인
- [ ] 키보드 표시 상태에서 입력 필드, 오류 메시지, 하단 CTA가 가려지지 않는지 확인
