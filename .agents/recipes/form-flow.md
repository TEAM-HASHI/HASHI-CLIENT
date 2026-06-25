# Form Flow Recipe

입력 폼, 단계형 상태, validation 흐름을 구현할 때 사용합니다.

## Read First

- `docs/conventions/coding.md`
- `docs/workflows/spec-writing.md`
- 필요한 경우 `docs/architecture/data-layer.md`

## Workflow

1. 입력값, derived state, submit 가능 조건을 먼저 정리합니다.
2. public hook이나 shared form component가 필요하면 `*.spec.md` 작성 여부를 판단합니다.
3. event handler는 `handle` 접두사를 사용하고, 비이벤트 함수에는 사용하지 않습니다.
4. validation, disabled, loading, error, success 상태를 분리합니다.
5. API mutation이 있으면 optimistic update, invalidation, error reset 책임을 명확히 합니다.
6. 접근성 속성과 keyboard submit 동작을 확인합니다.

## Preferred Commands

```bash
pnpm gen:hook
pnpm --filter @siksa/client lint
pnpm --filter @siksa/client typecheck
pnpm --filter @siksa/client test
```

## Done Criteria

- submit 조건과 UI disabled 상태가 일치합니다.
- error 메시지와 reset 흐름이 설명 가능합니다.
- form state가 SDS primitive 내부로 들어가지 않습니다.
