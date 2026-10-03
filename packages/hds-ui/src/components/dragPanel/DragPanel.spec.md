# Component Spec: `DragPanel`

Jira: HASHI-214

Status: 구현 및 자동 테스트 추가. 검증 결과는 아래 Verification에 기록합니다.

## Purpose

배경과 함께 사용할 수 있는 비모달 높이 조절 패널입니다. 지도와 컬렉션은 같은 패널을 사용하되 화면별 높이 설정과 콘텐츠는 호출부에서 제공합니다.

## Component Type

- HDS UI primitive: 제품 데이터와 무관한 패널 구조, 높이 조절, 내부 스크롤 및 접근성 동작을 담당합니다.
- 구현 위치: `packages/hds-ui/src/components/dragPanel/DragPanel.tsx`

## Design Decision: BottomSheet와 분리

기존 공컴을 우선 검토했으며, `BottomSheet`를 수정하지 않고 import하여 드래그 기능만 추가하는 래퍼 방식도 검토했습니다.

현재 [BottomSheet](../bottomSheet/BottomSheet.tsx)는 모달 전용입니다.

- 화면 전체 overlay가 배경 입력을 가립니다.
- 열림 상태에서 배경 스크롤 잠금과 focus trap을 실행합니다.
- `aria-modal="true"`가 고정되어 있습니다.
- 이 동작들을 해제하는 public option이 없으며, `className`은 내부 패널에만 적용됩니다.
- 손잡이는 시각 요소이며 실제 드래그 및 높이 조절 기능은 없습니다.

따라서 외부에서 드래그를 추가해도 모달 동작은 남습니다. 래퍼 방식 자체가 불가능한 것은 아니지만, 현재 public API로는 배경을 조작할 수 있는 비모달 패널 요구를 충족하지 못합니다.

결정:

- 기존 `BottomSheet`의 코드와 public API, 사용 화면은 변경하지 않습니다.
- `DragPanel`은 별도 공컴으로 구현합니다. 기존 모달의 DOM을 외부에서 조작하거나 CSS로 모달 동작을 우회하지 않습니다.
- 기존 유틸리티와 디자인 토큰은 적합한 경우 재사용합니다. 시각적 유사성만으로 모달 동작까지 재사용하지 않습니다.
- 지도 전용과 컬렉션 전용 패널을 각각 만들지 않습니다. 공통 패널 하나를 각 화면이 가져다 씁니다.

### 시각적 shell 재사용 검토

BottomSheet와 DragPanel은 `bg-white`, 상단 `20px` radius 등 일부
panel surface 표현을 공유합니다.

다만 현재 BottomSheet의 header/handle은 DragPanel과 규격 및 역할이 다릅니다.
BottomSheet의 handle은 시각적 indicator인 반면, DragPanel의 handle 영역은
pointer 및 keyboard 입력을 받는 실제 높이 조절 control입니다.

현재 두 컴포넌트에서 실질적으로 공통화할 표현이 제한적이므로,
이번 PR에서는 별도 primitive를 추가하지 않습니다.

향후 sheet 계열 컴포넌트에서 공통 surface 규격이 늘어날 경우
presentational primitive 분리를 검토합니다.

### Motion 재사용

BottomSheet와 DragPanel은 기능과 접근성 역할은 다르지만,
화면 하단 패널 계열 컴포넌트로서 동일한 motion 감각을 유지합니다.

DragPanel의 최초 등장에는 BottomSheet와 동일한
`animate-bottom-sheet-panel-in`을 재사용합니다.

또한 DragPanel의 접힘 · 일반 · 최대 단계 전환에도
BottomSheet panel motion과 동일한 380ms와
`cubic-bezier(0.22, 1, 0.36, 1)` timing을 사용합니다.

단, 실제 pointer drag 중에는 transition을 적용하지 않습니다.
드래그 중에는 패널이 사용자의 포인터를 즉시 따라가고,
손을 놓아 다음 단계가 결정된 이후에만 부드러운 snap transition을 적용합니다.

BottomSheet의 `panel-out` motion은 사용하지 않습니다.
DragPanel의 접힘은 닫힘이나 unmount가 아니라
30px 손잡이를 유지하는 하나의 높이 단계이기 때문입니다.

## Public API

`@hashi/hds-ui`에서 `DragPanel`, `DragPanelProps`를 export합니다.

```tsx
import { useState } from 'react'
import { DragPanel } from '@hashi/hds-ui'

// 높이는 예시입니다. 실제 화면의 Figma 규격은 호출부가 제공합니다.
const [height, setHeight] = useState(318)

<div className="relative h-full">
  <DragPanel
    height={height}
    normalHeight={318}
    maxHeight={682}
    onHeightChange={setHeight}
    aria-label="목록"
    handleLabel="목록 패널 높이 조절"
  >
    {content}
  </DragPanel>
</div>
```

| Prop               | Type                       | 의미                                           |
| ------------------ | -------------------------- | ---------------------------------------------- |
| `height`           | `number`                   | 호출부가 소유하는 현재 높이(px)                |
| `normalHeight`     | `number`                   | 화면별 일반 높이 단계(px)                      |
| `maxHeight`        | `number`                   | 화면별 최대 높이(px)                           |
| `onHeightChange`   | `(height: number) => void` | 드래그 종료 또는 키보드 조작 시 높이 변경 요청 |
| `children`         | `ReactNode`                | 스크롤되는 본문                                |
| `header`, `footer` | `ReactNode`                | 선택적 고정 영역. 본문과 함께 스크롤되지 않음  |
| `aria-label`       | `string`                   | 패널 region의 접근성 이름                      |
| `handleLabel`      | `string`                   | 높이 조절 손잡이의 접근성 이름                 |
| `className`        | `string`                   | 선택적 패널 스타일                             |

높이는 유한한 px 값으로 전달하며 `30 <= normalHeight <= maxHeight`를 기준으로 설정합니다. `height`는 실제 사용 가능한 영역 안으로 제한하여 표시합니다. 소비자는 callback 결과를 `height`에 반영해야 합니다.

호출부는 위치와 높이가 정해진 relative 컨테이너를 제공하며, 하단 내비게이션 및 safe-area를 제외한 공간으로 배치합니다. 패널은 해당 컨테이너 하단에 붙고, viewport가 줄어들면 높이와 하단 위치를 보정합니다. 내비게이션의 DOM이나 높이를 공컴 내부에서 추측하지 않습니다.

- 패널 책임: 손잡이 드래그, 높이 제한, 내부 스크롤, 접근성 상호작용.
- 호출부 책임: 화면별 높이 및 스크롤 설정, 콘텐츠, 하단 내비게이션을 고려한 배치.
- 호출부가 소유하는 기능: 지도, 마커, 컬렉션 데이터, API, 라우팅, 메뉴 및 비즈니스 상태.

## Agreed Behavior

- 손잡이와 그 주변 터치 영역에서만 드래그를 시작합니다. 목록이나 제목에서 시작한 입력으로 높이를 변경하지 않습니다.
- 아래로 끝까지 내려도 패널을 닫거나 제거하지 않고 다시 펼칠 수 있는 손잡이를 남깁니다.
- 드래그 종료 시 시작 단계와 이동 방향을 기준으로 다음 높이 단계를 결정합니다.
- 12px의 dead zone을 초과한 드래그는 이동 방향을 기준으로 높이 단계를 결정합니다.
- dead zone 안의 미세한 움직임은 의도하지 않은 입력으로 보고 시작 단계를 유지합니다.
- 기본적으로 인접 단계로 이동하되, 드래그 중 중간 단계를 충분히 넘어선 경우 한 번의 gesture에서 두 단계 이동할 수 있습니다.
- 드래그 종료 위치의 단순 nearest 계산이 아니라 이동 방향과 실제로 통과한 단계 범위를 함께 사용합니다.
- 드래그 중에는 내부 임시 높이를 표시하고, 정상 종료 시 한 번 높이 변경을 요청합니다. 포인터 취소 또는 예기치 않은 capture 손실은 변경을 요청하지 않고 호출부 높이로 돌아갑니다.
- 일반 높이와 최대 높이 모두 콘텐츠가 넘치면 내부 목록을 스크롤할 수 있습니다.
- 같은 목록을 접었다 펼치면 기존 목록 스크롤 위치를 유지합니다.
- 화면별 높이 설정은 달라도 됩니다. 작은 화면에서는 사용 가능한 높이로 제한하고 하단 내비게이션을 가리지 않습니다.
- 배경을 가리는 모달 overlay와 focus trap을 적용하지 않습니다.
- 최초 mount 시 BottomSheet와 동일한 `animate-bottom-sheet-panel-in` motion을 사용해 화면 하단에서 등장합니다.
- 드래그 중에는 transition을 적용하지 않고 포인터 이동을 즉시 따라갑니다.
- 드래그 종료 후 인접 높이 단계로 이동할 때는 BottomSheet와 동일한 380ms, cubic-bezier(0.22, 1, 0.36, 1) motion timing을 사용해 부드럽게 전환합니다.

## Design Decision: 방향 기반 단계 전환

DragPanel은 접힘(30px) · 일반 · 최대의 3단계 상태를 사용합니다.

사용자가 손잡이를 위로 드래그하면 인접한 한 단계 위로,
아래로 드래그하면 인접한 한 단계 아래로 이동합니다.

드래그 종료 위치와 가장 가까운 단계를 계산하는 방식은 사용하지 않습니다.
이 방식은 패널을 펼치려는 사용자가 충분한 거리까지 끌지 않았다는 이유로
다시 접힌 상태로 돌아가는 등, 사용자의 방향 의도와 다른 결과를 만들 수 있기 때문입니다.

대신 이동 방향을 우선하며,
포인터의 미세한 떨림이나 실수로 단계가 변경되는 것을 막기 위해
12px의 dead zone을 둡니다.

dead zone을 초과한 gesture는 우선 이동 방향의 인접 단계로 이동합니다.

다만 사용자가 드래그 중 중간 단계를 충분히 지나 다음 단계 영역까지
직접 이동한 경우에는 한 번의 gesture에서 두 단계 이동을 허용합니다.

이를 통해 짧은 드래그는 예측 가능한 한 단계 이동으로 처리하면서,
큰 드래그에서는 사용자가 실제로 이동시킨 거리를 무시하지 않습니다.

네이버 지도 모바일 패널의 단계형 interaction을 레퍼런스로 참고했으며,
HASHI DragPanel에서는 실제 사용 시 단계 전환의 예측 가능성을 높이기 위해
방향 기반 전환 정책을 적용합니다.

단계별 실제 높이 값은 공컴에서 고정하지 않으며,
각 사용 화면의 Figma 규격 및 실제 적용 과정에서 조정할 수 있습니다.

## Accessibility And Scroll

- 손잡이는 이름 있는 vertical slider입니다. ArrowUp/ArrowDown은 다음/이전 단계, Home/End는 접힘/최대 단계로 이동합니다.
- 패널은 모달이 아닌 이름 있는 region입니다. 배경 포커스를 가두거나 문서 스크롤을 잠그지 않습니다.
- 접힌 콘텐츠는 DOM을 유지하되 `inert` 및 비노출 처리합니다. 접힐 때 내부에 포커스가 있으면 손잡이로 이동합니다.
- 본문은 현재 높이에서 overflow 시 스크롤됩니다. 손잡이에만 `touch-action: none`을 적용하며 본문의 터치 스크롤은 막지 않습니다.
- 같은 목록의 접기/펼치기 사이에 scrollTop을 복원합니다. 새 컬렉션으로 전환하거나 목록을 교체할 때의 초기화 정책은 호출부 책임이며 필요하면 key로 구분합니다.
- 헤더/푸터는 본문과 분리합니다. 호출부는 사용할 최소 확장 높이에 고정 영역이 들어가도록 구성해야 합니다.

## Implementation Notes

- Pointer Events 및 pointer capture로 마우스/터치/펜 입력을 처리하며 새 의존성은 추가하지 않습니다.
- 최초 등장 animation은 BottomSheet와 동일한 `animate-bottom-sheet-panel-in` token utility를 재사용하며 별도 motion 값을 정의하지 않습니다.
- 동적으로 계산되는 높이와 viewport 하단 보정만 inline style을 사용합니다. 나머지는 Tailwind utility와 기존 `cn`을 사용합니다.
- 손잡이 색상 `#d9d9d9`는 확인한 Figma 값입니다. 현재 동일한 토큰이 없어 컴포넌트 내부에 한 번 정의하며 임의의 근접 토큰으로 바꾸지 않습니다.
- 손잡이 터치 영역은 패널 너비 전체, 높이 30px이며 목록과 제목은 포함하지 않습니다.
- 일반 높이와 최대 높이는 공컴의 제품별 상수가 아닙니다. Storybook의 값은 설정 예시이며 각 페이지의 최종 규격 확정과 연결은 후속 PR에서 수행합니다.

## Storybook

Default, Collapsed, Expanded, AlternateHeights, Empty, SmallContainer, WithFixedSlots로 높이 설정, 배경 조작, 빈/긴 콘텐츠, 고정 영역을 확인합니다. 도메인 데이터나 API mock은 포함하지 않습니다.

## Design Reference

- [접힌 상태 Figma](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-32847&m=dev)
- 해당 프레임 기준: 화면 393 x 852px, 하단 내비게이션 84px, 내비게이션 위 노출 패널 30px, 손잡이 67 x 5px, 손잡이 상단 간격 12px, 패널 상단 모서리 20px.
- 이 값은 해당 디자인의 측정 기준입니다. 지도 전체나 내비게이션을 공컴 내부에 구현하거나 모든 화면 높이를 이 프레임에 고정하지 않습니다.

## Verification

### Automated

- [x] dead zone을 초과한 위/아래 드래그가 방향에 따라 인접 단계로 이동
- [x] dead zone 안의 미세한 움직임은 현재 단계 유지
- [x] 기본 drag는 방향에 따라 인접 단계로 이동
- [x] 중간 단계를 충분히 넘긴 drag는 한 gesture에서 두 단계 이동 가능
- [x] 드래그 중 height transition 미적용
- [x] 드래그 종료 후 단계 이동 시 380ms snap transition 적용
- [x] 접힌 상태에서도 콘텐츠 DOM 유지
- [x] 접기/펼치기 후 스크롤 위치 복원
- [x] 키보드로 단계 이동
- [x] 비모달 동작 유지
- [x] 작은 컨테이너에서 높이 제한
- [x] 취소된 pointer gesture에서 높이를 commit하지 않음
- [x] BottomSheet와 동일한 초기 panel entrance motion 적용

### Manual

- [ ] 실제 모바일 환경에서 손잡이 드래그와 목록 스크롤 충돌 확인
- [ ] 지도 위에서 배경 터치/드래그가 정상 동작하는지 확인
- [ ] Figma 기준 픽셀 QA
- [ ] 실제 하단 Navigation과 조합 확인
- [ ] 모바일 키보드가 열린 상태에서 레이아웃 확인

## PR Scope And Rationale

드래그 패널 PR 설명에는 다음 판단 근거와 경계를 포함합니다.

- 기존 `BottomSheet` 재사용과 수정 없는 래퍼 방식을 검토했지만, 고정된 모달 동작 때문에 비모달 요구와 맞지 않아 별도 공컴을 선택했습니다.
- 기존 `BottomSheet`는 변경하지 않으며, 지도와 컬렉션이 공통 `DragPanel`을 사용합니다.
- 이 PR은 패널, 명세, Storybook, 테스트를 다룹니다. 지도 및 컬렉션 화면 구현과 API 연동은 포함하지 않습니다.
- 후속 컬렉션 퍼블리싱은 이 패널을 사용하며 작업 단위별 별도 PR로 진행합니다.
- PR 작성 시 실제 구현 API와 검증 결과를 보완합니다. 이 문서의 계획을 구현 완료나 검증 통과로 표시하지 않습니다.
