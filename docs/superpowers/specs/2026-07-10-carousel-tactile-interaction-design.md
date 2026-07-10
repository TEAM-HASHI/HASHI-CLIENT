# Carousel Tactile Interaction Design

## Context

HASHI-98 1차 QA에서 HDS `Carousel`의 기본 swipe는 동작하지만, 드래그 시작과 종료를 시각적으로 느낄 수 있는 피드백이 부족하다. 같은 HDS 컴포넌트를 홈 큐레이션, 매거진 배너, 식당 상세 이미지, 리뷰 이미지 뷰어가 사용하므로 콘텐츠 종류와 무관하게 적용할 수 있는 저강도 interaction이 필요하다.

## Goal

- 모든 HDS Carousel 사용처에 일관된 촉각형 시각 피드백을 제공한다.
- 기존 Embla swipe와 snap 동작을 유지한다.
- 현재 compound API와 호출부 코드를 변경하지 않는다.
- 사용자가 motion 감소를 요청한 환경에서는 장식 motion을 제거한다.

## Interaction Design

### Drag feedback

- Embla의 `pointerDown`에서 내부 drag 상태를 활성화한다.
- drag 중 현재 slide만 `scale(0.985)`와 `opacity: 0.98`을 적용한다.
- `pointerUp` 또는 `settle`에서 drag 상태를 해제한다.
- slide는 약 `220ms`의 ease-out 전환으로 원래 크기와 불투명도로 복원한다.
- viewport는 pointer 환경에서 `grab`, drag 중에는 `grabbing` cursor를 표시한다.
- slide children의 click, link, button 동작과 Embla의 drag 후 click 방지 계약은 그대로 유지한다.

### Indicator feedback

- 현재 indicator pill의 폭 전환을 유지하면서 scale과 opacity 전환을 함께 적용한다.
- active indicator는 기본 크기와 완전한 불투명도를 사용한다.
- inactive indicator는 약한 축소와 낮은 불투명도를 사용한다.
- 전환은 slide 복원보다 짧게 유지해 현재 위치를 즉시 인식할 수 있게 한다.

### Reduced motion

- `prefers-reduced-motion: reduce`에서는 slide scale, opacity 변화와 관련 transition을 적용하지 않는다.
- Embla의 programmatic 이동에 이미 적용된 즉시 이동 정책을 유지한다.
- cursor와 현재 slide/indicator 상태 정보는 유지한다.

## Architecture

- `Carousel.Root`가 Embla 이벤트로 `isDragging` 내부 상태를 관리한다.
- `CarouselContext`가 `isDragging`을 `Viewport`와 `Item`에 전달한다.
- `Carousel.Viewport`는 drag 상태를 `data-dragging`으로 노출하고 cursor 스타일을 결정한다.
- `Carousel.Item`은 `currentIndex`와 `isDragging`을 조합해 현재 slide에만 feedback을 적용한다.
- `Carousel.Indicator`는 기존 index 상태를 사용하며 새로운 public prop을 추가하지 않는다.
- 구현은 HDS 내부 Tailwind class와 기존 `cn` 유틸만 사용한다.

## Public API

변경 없음. 다음 compound API와 props 계약을 유지한다.

- `Carousel.Root`
- `Carousel.Viewport`
- `Carousel.Track`
- `Carousel.Item`
- `Carousel.Indicator`

## Accessibility

- 기존 carousel region과 slide label 계약을 유지한다.
- indicator는 현재처럼 비포커스 표시 요소로 유지한다.
- autoplay, infinite loop, clickable indicator, keyboard navigation은 이번 범위에 추가하지 않는다.
- reduced-motion 사용자에게 장식성 transform과 opacity motion을 강제하지 않는다.

## Testing

- drag 전 viewport가 idle 상태임을 확인한다.
- pointer down 후 viewport가 dragging 상태가 되고 현재 slide에 feedback 상태가 적용되는지 확인한다.
- pointer up 또는 settle 후 idle 상태로 복원되는지 확인한다.
- 현재 slide만 feedback 대상이며 다른 slide에는 적용되지 않는지 확인한다.
- reduced-motion 대응 class와 indicator 전환 class가 포함되는지 확인한다.
- 기존 controlled/uncontrolled index, swipe, indicator, accessibility 테스트가 계속 통과해야 한다.
- Storybook의 swipe interaction 예시에서 drag/settle feedback을 수동 확인한다.

## Out of Scope

- autoplay와 infinite loop
- clickable indicator와 arrow button
- keyboard navigation 추가
- scroll progress 기반 parallax
- 이미지 전용 zoom 또는 gradient 효과
- 진동이나 WebView bridge 기반 haptic feedback
- 호출부별 motion 강도 설정 prop

## Acceptance Criteria

1. 모든 기존 HDS Carousel 호출부가 코드 변경 없이 촉각형 feedback을 사용한다.
2. drag 중 현재 slide만 미세하게 눌리고 pointer release 후 자연스럽게 복원된다.
3. indicator가 active index 변경을 짧은 scale, opacity, width 전환으로 표현한다.
4. reduced-motion 환경에서 장식 transform과 opacity 효과가 제거된다.
5. Carousel public API와 접근성 markup은 변경되지 않는다.
6. HDS lint, typecheck, build, test와 Storybook build가 통과한다.
