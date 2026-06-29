# Coding Convention

HASHI Client 코드 작성 기준입니다. 현재 저장소의 generator와 기존 코드 패턴을 우선 기준으로 삼습니다.

## 폴더, 파일, 컴포넌트 네이밍

| 대상            | 컨벤션             | 예시                            |
| --------------- | ------------------ | ------------------------------- |
| 폴더            | `camelCase`        | `userProfile/`, `loginForm/`    |
| 일반 `.ts` 파일 | `camelCase`        | `formatDate.ts`, `routes.ts`    |
| 컴포넌트 파일   | `PascalCase`       | `UserCard.tsx`, `LoginPage.tsx` |
| Hook 파일       | `usePascalCase.ts` | `useAuth.ts`, `useUserQuery.ts` |
| 컴포넌트        | `PascalCase`       | `UserCard`, `LoginPage`         |

현재 generator는 다음 위치에 파일을 생성합니다.

| Generator               | 생성 위치                                                                      |
| ----------------------- | ------------------------------------------------------------------------------ |
| `pnpm gen:page`         | `apps/client/src/pages/{{camelCase name}}/{{PascalCase name}}Page.tsx`         |
| `pnpm gen:component`    | `apps/client/src/shared/components/{{camelCase name}}/{{PascalCase name}}.tsx` |
| `pnpm gen:hook`         | `apps/client/src/shared/hooks/use{{PascalCase name}}.ts`                       |
| `pnpm gen:ds-component` | `packages/hds-ui/src/components/{{camelCase name}}/{{PascalCase name}}.tsx`    |

`gen:ds-component`는 component 파일과 함께 `*.spec.md`, `*.stories.tsx`, local `index.ts`, public export를 생성합니다.

## 컴포넌트

- 컴포넌트는 arrow function으로 선언합니다.
- 컴포넌트는 named export를 사용합니다.
- 의미 없는 `div` 사용을 지양하고, 가능한 semantic tag를 사용합니다.
- 최상단 wrapper가 필요 없으면 Fragment를 사용합니다.
- children이 없으면 self-closing 형태를 사용합니다.
- 버튼 역할은 `button` 요소를 사용합니다.
- 텍스트가 없는 아이콘 버튼에는 `aria-label`을 제공합니다.

```tsx
export const InfoText = () => {
  return (
    <>
      <h1>Welcome!</h1>
      <p>This is our new page.</p>
    </>
  )
}
```

```tsx
<Button />
```

## 타입 컨벤션

- 타입 이름은 `PascalCase`를 사용합니다.
- 객체 구조는 `interface` 사용을 우선 검토합니다.
- 유니온, 리터럴, 조합 타입은 `type`을 사용합니다.
- Props 타입은 `Props` 접미사를 사용합니다.
- 일반 `type` 이름에는 `Types` 접미사를 사용합니다.

```tsx
import type { ReactNode } from 'react'

interface ButtonProps {
  size: ButtonSizeTypes
  children: ReactNode
}

type ButtonSizeTypes = 'sm' | 'md' | 'lg'
type ThemeModeTypes = 'light' | 'dark'
```

## 함수 컨벤션

- 함수는 arrow function으로 작성합니다.
- 함수명은 역할이 드러나도록 작성합니다.
- 이벤트 핸들러에는 `handle` 접두사를 사용합니다.
- 이벤트 핸들러가 아닌 함수에는 `handle`을 사용하지 않습니다.
- boolean을 반환하는 함수는 `is`, `has`, `check` 등을 사용해 의미를 드러냅니다.

```ts
const getUserData = () => {}

const createUser = () => {}

const checkIsValidEmail = () => {}

const convertDateFormat = () => {}

const handleSubmitClick = () => {}
```

## Hook 컨벤션

- 커스텀 Hook은 `use` 접두사를 사용합니다.
- Hook 파일은 `usePascalCase.ts` 형식을 사용합니다.
- 유틸, 상수, 커스텀 Hook 파일은 `.ts` 확장자를 사용합니다.

```text
hooks/useAuth.ts
utils/formatDate.ts
constants/routes.ts
```

## 변수 컨벤션

- `const`를 우선 사용하고, 필요한 경우에만 `let`을 사용합니다.
- `var`는 사용하지 않습니다.
- 상수는 `UPPER_SNAKE_CASE`를 사용합니다.
- 줄임말을 지양하고 의미 있는 변수명을 사용합니다.
- 복수 데이터는 이름 끝에 `s`를 붙입니다.
- boolean 값은 `is` 접두사를 우선 사용합니다.
- 문자열 조합은 template literal을 사용합니다.

```ts
const API_KEY = '...'

const userData = {}
const users = []
const isActive = true

const message = `${userName}님 환영합니다.`
```

## 배열과 메소드

- 배열 복사는 spread 연산자를 사용합니다.
- 반복문은 가능한 `for`보다 `forEach`, `map` 등 배열 메소드를 사용합니다.
- 객체 인자는 구조 분해 할당을 사용합니다.

```ts
const copiedUsers = [...users]
```

```tsx
{
  users.map(({ id, name }) => <UserCard key={id} name={name} />)
}
```

## Key 사용 기준

- 동적 리스트에서는 반드시 고유한 `id`를 `key`로 사용합니다.
- 항목의 개수와 순서가 절대 변하지 않는 정적 리스트에서는 `index`를 사용할 수 있습니다.
- 항목이 추가, 삭제, 정렬될 수 있는 경우에는 `index`를 `key`로 사용하지 않습니다.

## Tailwind CSS 컨벤션

Tailwind CSS를 사용하는 화면과 컴포넌트는 다음 기준을 따릅니다.

- 스타일은 기본적으로 Tailwind utility class를 사용합니다.
- 반복되는 UI 패턴은 긴 `className`을 복사하지 않고 컴포넌트로 분리합니다.
- 조건부 스타일은 문자열을 직접 이어붙이기보다 `clsx`, `cn` 같은 유틸 함수를 사용합니다.
- 색상, spacing, font size 등 공통 디자인 값은 Tailwind theme에서 관리합니다.
- 별도 token 패키지가 도입된 경우 공통 디자인 값은 해당 token을 우선 사용합니다.
- arbitrary value는 꼭 필요한 경우에만 사용합니다.
- 너무 긴 `className`은 가독성을 위해 줄바꿈합니다.
- 전역 스타일은 최소화하고 reset/base style 정도만 관리합니다.
- `!important` 사용은 지양합니다.

## ClassName 작성 순서

```text
1. Layout: flex, grid, block, hidden
2. Position: relative, absolute, fixed, sticky
3. Box Model: w, h, min, max, p, m
4. Border: border, rounded
5. Background: bg
6. Typography: text, font, leading, tracking
7. Effect: shadow, opacity
8. Interaction: cursor, hover, focus, active, disabled
9. Responsive: sm, md, lg, xl
```

```tsx
<button className="flex h-10 w-full items-center justify-center rounded-md border bg-white px-4 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
  저장
</button>
```

```tsx
<button
  className={cn(
    'flex items-center justify-center rounded-md text-sm font-medium',
    variant === 'primary' && 'bg-blue-500 text-white',
    variant === 'secondary' && 'bg-gray-100 text-gray-900',
    disabled && 'cursor-not-allowed opacity-50',
  )}
>
  저장
</button>
```
