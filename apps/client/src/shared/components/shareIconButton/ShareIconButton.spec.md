# Component Spec: `ShareIconButton`

## Purpose

- 앱 안의 공유하기 아이콘 버튼에서 공유 대상 링크를 클립보드에 복사합니다.

## Public API

- export: `ShareIconButton`
- props:
  - `shareUrl?: string`
- accessible name: `공유하기`

## Behavior

- `shareUrl`이 있으면 클릭 시 해당 값을 현재 origin 기준 absolute URL로 정규화해 클립보드에 복사합니다.
- `shareUrl`이 없으면 클릭 시 `window.location.href`를 클립보드에 복사합니다.
- Clipboard API가 실패하거나 사용할 수 없는 환경에서는 textarea 기반 fallback으로 복사를 시도합니다.
- 링크 복사에 성공하면 HDS `showToast`로 `링크가 복사 되었어요.` 토스트를 표시합니다.

## Placement

- `apps/client/src/shared/components/shareIconButton`
- 공유 링크 복사는 모든 공유 아이콘에 동일하게 적용되는 앱 공통 동작이므로 page handler가 아니라 공유 아이콘 전용 app shared component가 소유합니다.

## Verification

- [ ] `pnpm --filter @hashi/client test -- ShareIconButton.test.tsx`
- [ ] `pnpm --filter @hashi/client exec vitest run src/shared/utils/clipboard.test.ts`
- [ ] `pnpm --filter @hashi/client lint`
- [ ] `pnpm --filter @hashi/client typecheck`
