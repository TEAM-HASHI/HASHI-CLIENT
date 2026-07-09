# ComingSoonDialog

## Purpose

`ComingSoonDialog`는 아직 구현되지 않은 기능을 눌렀을 때 공통 준비중 안내를 보여주는 shared dialog 컴포넌트입니다.

마이페이지뿐 아니라 MVP 제외 기능이 노출되는 다른 화면에서도 같은 안내 UI를 재사용하기 위해 `shared/components`에 둡니다.

## Usage Location

- `apps/client/src/shared/components/comingSoonDialog`

## Props

| Prop           | Type                      | Required | Description        |
| -------------- | ------------------------- | -------- | ------------------ |
| `open`         | `boolean`                 | yes      | dialog open state  |
| `onOpenChange` | `(open: boolean) => void` | yes      | open state handler |

## UI

- icon: `SmileIcon`
- title: `서비스를 준비하고 있어요.`
- description:
  - `더 편한 Hashi 이용을 위해`
  - `현재 기능을 준비하고 있어요.`
- action label: `확인`

## Behavior

- HDS `Dialog`를 조합합니다.
- `확인` 버튼을 누르면 dialog를 닫습니다.
- route 이동, API 호출, analytics 같은 도메인 동작은 담당하지 않습니다.
- 실제 기능 연결 전 임시 placeholder UI로만 사용합니다.

## Non-Goals

- 기능별 문구 variant
- route navigation
- async action
- error handling
