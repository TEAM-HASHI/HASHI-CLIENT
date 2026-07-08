# LoadingScreen

## Purpose

`LoadingScreen`은 route lazy loading처럼 화면 전체 fallback이 필요한 경우에 보여주는 공통 loading UI입니다.

## Public API

```tsx
<LoadingScreen />
<LoadingScreen message="정보를 불러오고 있어요" />
```

| Prop        | Type        | Required | Description                             |
| ----------- | ----------- | -------- | --------------------------------------- |
| `message`   | `ReactNode` | no       | 로딩 화면에 노출할 안내 문구            |
| `className` | `string`    | no       | 사용처에서 layout을 보정하기 위한 class |

`div` element의 기본 props를 받을 수 있지만, children은 컴포넌트가 소유합니다.

## Requirements

- 기본 문구는 `로딩 중이에요`입니다.
- loading graphic은 `apps/client/src/shared/assets/images/loading.gif`를 사용합니다.
- chopsticks graphic은 `apps/client/src/shared/assets/images/graphic_chopsticks.webp`를 사용합니다.
- graphic은 장식 이미지로 처리하고, 안내 문구가 접근 가능한 status 역할을 담당합니다.
- root는 전체 viewport 높이를 채우고 중앙 정렬합니다.
- root는 landmark 중첩을 피하기 위해 `main`이 아닌 `div`로 렌더링합니다.
- root는 `aria-busy="true"`를 가집니다.
- 안내 문구는 `role="status"`와 `aria-live="polite"`를 가집니다.
- Figma 기준으로 loading graphic은 216px, chopsticks graphic은 128px 너비로 노출합니다.
- loading graphic과 chopsticks graphic 사이는 28px, chopsticks graphic과 안내 문구 사이는 32px입니다.

## Usage Policy

- route lazy loading fallback에서 사용합니다.
- page 또는 section 내부 Suspense가 화면 전체 loading을 의도할 때 명시적으로 fallback에 주입합니다.
- page 내부 API loading state에서도 같은 전체 화면 로딩이 필요할 때 명시적으로 재사용할 수 있습니다.
- 앱 전역 `AsyncBoundary`의 기본 fallback으로 사용하지 않습니다.
- 버튼 제출 중처럼 화면 전체를 막을 필요가 없는 경우에는 HDS `Button`의 loading 상태를 우선 사용합니다.

## Verification

- `LoadingScreen` 기본 문구와 custom message 렌더링을 확인합니다.
- route lazy fallback이 `LoadingScreen`을 사용하는지 확인합니다.
