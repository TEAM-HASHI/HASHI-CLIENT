# Carousel Tactile Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 HDS Carousel에 공개 API 변경 없이 은은한 drag 압축·복원과 indicator 상태 전환을 추가한다.

**Architecture:** `Carousel.Root`가 Embla의 `pointerDown`, `pointerUp`, `settle` 이벤트를 내부 `isDragging` 상태로 변환하고 Context로 전달한다. `Viewport`와 현재 `Item`이 이 상태를 data attribute와 Tailwind motion class로 표현하며, `Indicator`는 기존 index를 이용해 active/inactive scale과 opacity를 전환한다.

**Tech Stack:** React 19, TypeScript, Embla Carousel React 8.6.0, Tailwind CSS 4, Vitest, Testing Library, Storybook

## Global Constraints

- 모든 기존 HDS Carousel 호출부에 코드 변경 없이 적용한다.
- drag 중 현재 slide만 `scale(0.985)`와 `opacity: 0.98`을 적용한다.
- pointer release 후 약 `220ms` ease-out으로 원래 상태로 복원한다.
- `prefers-reduced-motion: reduce`에서는 장식 transform, opacity, transition을 제거한다.
- `Carousel` compound API와 접근성 markup은 변경하지 않는다.
- autoplay, infinite loop, clickable indicator, keyboard navigation, parallax, haptic feedback은 추가하지 않는다.

---

### Task 1: Carousel tactile interaction

**Files:**

- Modify: `packages/hds-ui/src/components/carousel/Carousel.test.tsx`
- Modify: `packages/hds-ui/src/components/carousel/Carousel.tsx`
- Modify: `packages/hds-ui/src/components/carousel/Carousel.spec.md`
- Modify: `packages/hds-ui/package.json`
- Modify: `packages/hds-ui/test/setup.ts`
- Modify: `apps/client/test/setup.ts`
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: Embla API events `pointerDown`, `pointerUp`, `settle`; existing `CarouselContext`; existing `cn` utility.
- Produces: internal `isDragging: boolean`, viewport `data-dragging`, current item `data-dragging`; no public API changes.

- [x] **Step 1: Write the failing drag feedback test**

Add `fireEvent` to the Testing Library import. JSDOM does not calculate carousel layout, so add this helper before the tests:

```tsx
const mockCarouselLayout = () => {
  const getPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue

  vi.spyOn(
    CSSStyleDeclaration.prototype,
    'getPropertyValue',
  ).mockImplementation(function (this: CSSStyleDeclaration, property: string) {
    const value = getPropertyValue.call(this, property)

    return property === 'margin-right' && value === '' ? '0px' : value
  })
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(
    document.body,
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200)
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(
    function (this: HTMLElement) {
      if (!this.hasAttribute('data-hds-carousel-item')) {
        return 0
      }

      return Array.from(this.parentElement?.children ?? []).indexOf(this) * 300
    },
  )
}
```

Add this test to `Carousel.test.tsx`:

```tsx
it('adds tactile feedback only to the current slide while dragging', () => {
  mockCarouselLayout()

  renderCarousel()

  const viewport = getViewport()
  const currentSlide = screen.getByRole('group', { name: '1 / 3' })
  const nextSlide = screen.getByRole('group', { name: '2 / 3' })

  expect(viewport).toHaveClass('cursor-grab')
  expect(viewport).not.toHaveAttribute('data-dragging')

  fireEvent.mouseDown(viewport, {
    button: 0,
    clientX: 200,
    clientY: 100,
  })

  expect(viewport).toHaveAttribute('data-dragging', 'true')
  expect(viewport).toHaveClass('cursor-grabbing')
  expect(currentSlide).toHaveAttribute('data-dragging', 'true')
  expect(currentSlide).toHaveClass('scale-[0.985]', 'opacity-[0.98]')
  expect(nextSlide).not.toHaveAttribute('data-dragging')

  fireEvent.mouseUp(document, {
    clientX: 200,
    clientY: 100,
  })

  expect(viewport).not.toHaveAttribute('data-dragging')
  expect(viewport).toHaveClass('cursor-grab')
  expect(currentSlide).not.toHaveAttribute('data-dragging')
})
```

- [x] **Step 2: Run the drag test and verify RED**

Run:

```bash
corepack pnpm --filter @hashi/hds-ui exec vitest run src/components/carousel/Carousel.test.tsx
```

Expected: FAIL because the viewport has no `cursor-grab` or `data-dragging` state and the current item has no tactile feedback classes.

- [x] **Step 3: Implement Embla drag state and slide feedback**

Extend `CarouselContextValue`:

```tsx
type CarouselContextValue = {
  currentIndex: number
  isDragging: boolean
  itemCount: number
  setCurrentIndex: (index: number) => void
  setItemCount: (itemCount: number) => void
  viewportRef: EmblaViewportRefType
}
```

Inside `Carousel.Root`, create state and subscribe to Embla events:

```tsx
const [isDragging, setIsDragging] = useState(false)

useEffect(() => {
  if (!emblaApi) {
    return
  }

  const handlePointerDown = () => setIsDragging(true)
  const handlePointerRelease = () => setIsDragging(false)

  emblaApi.on('pointerDown', handlePointerDown)
  emblaApi.on('pointerUp', handlePointerRelease)
  emblaApi.on('settle', handlePointerRelease)

  return () => {
    emblaApi.off('pointerDown', handlePointerDown)
    emblaApi.off('pointerUp', handlePointerRelease)
    emblaApi.off('settle', handlePointerRelease)
  }
}, [emblaApi])
```

Include `isDragging` in the memoized context value and dependency list:

```tsx
const value = useMemo<CarouselContextValue>(
  () => ({
    currentIndex,
    isDragging,
    itemCount,
    setCurrentIndex,
    setItemCount,
    viewportRef,
  }),
  [currentIndex, isDragging, itemCount, setCurrentIndex, viewportRef],
)
```

Render viewport drag state and cursor feedback:

```tsx
const Viewport = ({ className, children, ...props }: CarouselViewportProps) => {
  const { isDragging, viewportRef } = useCarouselContext('Carousel.Viewport')

  return (
    <div
      {...props}
      className={cn(
        viewportBaseClassName,
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      data-dragging={isDragging || undefined}
      data-hds-carousel-viewport=""
      ref={viewportRef}
    >
      {children}
    </div>
  )
}
```

Apply feedback only to the current slide:

```tsx
const { currentIndex, isDragging } = useCarouselContext('Carousel.Item')
const isCurrent = currentIndex === __index
const hasDragFeedback = isCurrent && isDragging

className={cn(
  'h-full min-w-0 flex-[0_0_100%] transform-gpu transition-[transform,opacity] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none',
  hasDragFeedback && 'scale-[0.985] opacity-[0.98]',
  className,
)}
data-dragging={hasDragFeedback || undefined}
```

- [x] **Step 4: Run the drag test and verify GREEN**

Run:

```bash
corepack pnpm --filter @hashi/hds-ui exec vitest run src/components/carousel/Carousel.test.tsx
```

Expected: PASS, including the new drag feedback test.

- [x] **Step 5: Write the failing indicator motion test**

Add this test to `Carousel.test.tsx`:

```tsx
it('animates active and inactive indicator states', () => {
  renderCarousel()

  const dots = getIndicator().querySelectorAll('span')

  expect(dots[0]).toHaveClass(
    'scale-100',
    'opacity-100',
    'transition-[width,height,opacity,transform,background-color]',
    'motion-reduce:transition-none',
  )
  expect(dots[1]).toHaveClass('scale-90', 'opacity-70')
})
```

- [x] **Step 6: Run the indicator test and verify RED**

Run:

```bash
corepack pnpm --filter @hashi/hds-ui exec vitest run src/components/carousel/Carousel.test.tsx
```

Expected: FAIL because indicator dots do not yet include scale and opacity states or the expanded transition property list.

- [x] **Step 7: Implement indicator state motion**

Update the indicator dot classes in `Carousel.tsx`:

```tsx
className={cn(
  'block rounded-full transition-[width,height,opacity,transform,background-color] duration-150 ease-out motion-reduce:transition-none',
  isActive
    ? 'bg-warm-gray-300 h-1 w-[22px] scale-100 opacity-100'
    : 'bg-warm-gray-100 size-1.5 scale-90 opacity-70',
  dotClassName,
  isActive && activeDotClassName,
)}
```

- [x] **Step 8: Run Carousel tests and verify GREEN**

Run:

```bash
corepack pnpm --filter @hashi/hds-ui exec vitest run src/components/carousel/Carousel.test.tsx
```

Expected: PASS with all Carousel tests green.

- [x] **Step 9: Update the component spec**

Update `Carousel.spec.md` so the HDS responsibilities, states, behavior, styling, accessibility, Storybook checklist, and implementation notes state the following exact contracts:

```markdown
- Embla pointer 상태 기반 drag feedback과 settle 복원
- dragging: 현재 slide에만 `scale(0.985)`와 `opacity: 0.98`을 적용합니다.
- pointer release: 약 `220ms` ease-out으로 원래 상태를 복원합니다.
- viewport cursor: idle `grab`, dragging `grabbing`
- indicator transition: width, height, opacity, transform, background-color
- reduced motion: drag transform, opacity, transition을 제거합니다.
- public API와 indicator의 비포커스 접근성 계약은 유지합니다.
```

- [x] **Step 10: Run HDS and repository verification**

Run:

```bash
corepack pnpm --filter @hashi/hds-ui lint
corepack pnpm --filter @hashi/hds-ui typecheck
corepack pnpm --filter @hashi/hds-ui build
corepack pnpm --filter @hashi/hds-ui test
corepack pnpm --filter @hashi/hds-ui build-storybook
corepack pnpm format:check
git diff --check
bash .agents/scripts/check-harness.sh
```

Expected: every command exits `0`; HDS tests report zero failures; Storybook static build completes without errors.

- [x] **Step 11: Commit the implementation**

Run:

```bash
git add packages/hds-ui/src/components/carousel/Carousel.tsx packages/hds-ui/src/components/carousel/Carousel.test.tsx packages/hds-ui/src/components/carousel/Carousel.spec.md packages/hds-ui/package.json packages/hds-ui/test/setup.ts apps/client/test/setup.ts pnpm-workspace.yaml pnpm-lock.yaml docs/superpowers/plans/2026-07-10-carousel-tactile-interaction.md
git commit -m "feat(packages/hds-ui): HASHI-98 캐러셀 인터랙션 보강"
```

Expected: the commit contains only the Carousel implementation, tests, component spec, and this implementation plan; unrelated working-tree changes remain unstaged.
