# Hook Spec: `useHookName`

## Purpose

이 hook이 어떤 상태, side effect, 또는 비즈니스 흐름을 캡슐화하는지 작성합니다.

## Hook Type

- [ ] app shared hook
- [ ] feature hook
- [ ] page-local hook
- [ ] data fetching hook
- [ ] form or interaction hook

선택 기준:

- 여러 화면에서 반복되면 `apps/client/src/shared/hooks`를 검토합니다.
- 특정 feature에만 묶이면 feature 내부에 둡니다.
- 한 page에서만 쓰이면 page 내부 hook으로 둡니다.
- UI markup과 style 책임은 hook에 넣지 않습니다.

## Spec Location

- spec path:
- implementation path:

권장 위치:

- App shared hook: `apps/client/src/shared/hooks/useHookName.spec.md`
- Feature hook: 구현 hook과 같은 폴더의 `useHookName.spec.md`
- Page-local hook: 구현 hook과 같은 폴더의 `useHookName.spec.md`

## Usage

- 사용 위치:
  - `apps/client/src/shared/hooks/useHookName.ts`
  - `apps/client/src/features/{feature}/...`
  - `apps/client/src/pages/{page}/...`
- 이 hook을 사용하는 컴포넌트가 담당하지 않아도 되는 책임:

## Scaffold

필요한 경우 다음 generator를 우선 확인합니다.

```bash
pnpm gen:hook
```

## Inputs

### `paramName`

- type: `string`
- required: `true`
- description:

## Return Shape

```ts
const { state, action } = useHookName()
```

### `state`

- `value`:
- `isLoading`:
- `errorMessage`:

### `action`

- `submit`:
- `reset`:
- `changeValue`:

## Behavior

1. 초기화 시 어떤 값을 설정합니다.
2. 사용자가 어떤 action을 호출합니다.
3. 내부 상태가 어떻게 바뀝니다.
4. 필요한 경우 API 호출, cache update, navigation을 실행합니다.
5. 성공 또는 실패 결과를 반환합니다.

## Validation

- 어떤 입력을 검증하는지:
- 검증 실패 시 반환하는 상태 또는 메시지:
- submit 가능 조건:

## Side Effects

- API 호출:
- cache update/invalidation:
- localStorage/sessionStorage:
- navigation:
- alert/toast:
- logging/tracking:

## Error Handling

- 어떤 에러를 잡는지:
- 서버 메시지 우선순위:
- fallback message:
- 에러를 throw하는지 상태로 반환하는지:

## Dependencies

- API client:
- query/mutation:
- schema:
- router:
- storage:
- external libraries:

## Non-Goals

- UI 렌더링 책임:
- 스타일 책임:
- 특정 컴포넌트 markup 책임:
- 제품 copy 확정 책임:

## Verification

- [ ] 정상 케이스
- [ ] validation 실패 케이스
- [ ] API 실패 케이스
- [ ] side effect 발생 여부
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
