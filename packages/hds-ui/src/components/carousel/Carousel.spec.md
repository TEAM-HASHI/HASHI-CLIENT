# Component Spec: `Carousel`

## Purpose

`Carousel`은 여러 개의 content를 한 장씩 보여주고, 사용자가 직접 가로 스크롤 또는 스와이프로 넘길 수 있게 하는 HDS 공통 interaction primitive입니다.

HDS에서는 **Carousel의 compound slot 구조, viewport / track / item layout, scroll-snap 기반 한 장씩 이동, 현재 index 계산, controlled / uncontrolled index 계약, 현재 위치 indicator, 기본 접근성 계약, slot별 `className` 병합만 담당**합니다. 실제 이미지, 링크, route 이동, analytics, API 호출, WebView bridge, 도메인 copy/data 구성, image loading fallback, full-bleed 여부, section padding, 배너 비율은 각 앱 또는 App Shell / Page에서 처리합니다.

## Usage Location

- `packages/hds-ui/src/components/carousel/Carousel.tsx`

## HDS 책임

- 제품 도메인 데이터, route, API, logging, analytics에 의존하지 않는 공통 carousel primitive 제공
- `Carousel.Root` / `Carousel.Viewport` / `Carousel.Track` / `Carousel.Item` / `Carousel.Indicator` compound component API 제공
- current index controlled / uncontrolled 계약
- native horizontal scroll과 CSS scroll-snap 기반 swipe interaction
- 한 viewport에 한 slide씩 노출되는 item layout
- item 개수 기반 현재 위치 indicator 렌더링
- item이 1개 이하일 때 indicator 숨김
- indicator 하단 중앙 / 하단 끝 정렬 variant 제공
- `aria-label` 또는 `aria-labelledby` 기반 carousel 영역 라벨 계약
- carousel / slide 역할을 설명하는 `role`, `aria-roledescription`, slide 위치 정보 제공
- `className`을 각 slot 내부 class와 병합
- full-width parent fill이 가능한 기본 layout
- Storybook에서 기본 배너형, full-width형, text overlay형, single item, controlled index, interactive child, custom indicator 확인

## App Shell / Page 책임

- 실제 이미지, 텍스트, 링크, 버튼 content 구성
- image `alt` 작성
- slide 전체 클릭 시 route 이동 또는 callback 실행
- API query, mutation, cache invalidation, error handling
- analytics logging
- 로그인 / 권한 / 상태별 노출 제어
- WebView bridge 호출
- 도메인 copy 결정
- 도메인 데이터 layout 구성
- 어떤 상황에서 어떤 carousel을 렌더링할지 결정
- section padding, full-bleed 여부, max-width, page spacing
- viewport 비율과 높이 지정
- image 위 text overlay, gradient overlay, CTA 구성
- image loading, error, empty placeholder 구성
- safe area, app shell padding, page scroll restoration

## 별도 결정 필요

| 항목                        | 권장 방향                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| 컴포넌트 위치               | `packages/hds-ui` 공통 컴포넌트                                                               |
| API 형태                    | compound API                                                                                  |
| slide 이동 방식             | CSS scroll-snap + native horizontal scroll                                                    |
| 전환 속도                   | controlled index 이동은 native smooth scroll 기준, native swipe는 브라우저 스크롤 동작을 따름 |
| 자동 재생                   | v1 제외                                                                                       |
| 무한 루프                   | v1 제외                                                                                       |
| 좌우 화살표                 | v1 제외                                                                                       |
| dot pagination              | v1은 클릭 불가 현재 위치 표시만 지원                                                          |
| indicator 정렬              | `center` 기본, `end` 지원                                                                     |
| desktop swipe               | 트랙패드 / 터치 스크린 native horizontal scroll 지원                                          |
| mouse drag-to-scroll        | v1 제외                                                                                       |
| 한 화면 노출 개수           | v1은 1개씩 노출                                                                               |
| 크기 / 비율                 | 호출부 `className`으로 지정                                                                   |
| full-bleed 여부             | App Shell / Page에서 처리                                                                     |
| slide click                 | HDS가 소유하지 않고 children composition으로 처리                                             |
| text overlay                | HDS가 별도 slot을 제공하지 않고 `Carousel.Item` children으로 처리                             |
| `href` / `Link` / `asChild` | v1 제외                                                                                       |
| 이미지 fallback             | HDS가 소유하지 않음                                                                           |
| 접근성 라벨                 | `Carousel.Root`에 `aria-label` 또는 `aria-labelledby` 제공                                    |

## Figma References

| Node         | Name              | Size        | Usage                          |
| ------------ | ----------------- | ----------- | ------------------------------ |
| `1409:27175` | `banner_magazine` | `393 x 260` | image text overlay example     |
| `1735:36915` | `banner_magazine` | `353 x 160` | padded magazine banner example |
| `1735:36944` | `Rectangle 64`    | `393 x 234` | full-width image area example  |

Figma의 이미지와 도메인 예시는 HDS에 하드코딩하지 않습니다.

## 권장 API

`Carousel.Root`

Carousel의 현재 index 상태와 접근성 라벨을 관리합니다.

`Carousel.Viewport`

가로 스크롤 영역입니다. 호출부가 비율, 높이, radius, overflow 스타일을 조정할 수 있습니다.

`Carousel.Track`

slide item을 가로로 배치하는 flex track입니다.

`Carousel.Item`

viewport 기준 100% 너비를 차지하는 slide입니다. 실제 링크, 버튼, 이미지, 카드, text overlay content는 호출부가 children으로 전달합니다.

`Carousel.Indicator`

현재 위치를 표시하는 indicator입니다. v1에서는 클릭할 수 없고 focusable하지 않습니다. 기본 위치는 viewport 하단 중앙 overlay이며, text overlay 배너처럼 하단 왼쪽 content와 충돌할 수 있는 경우 하단 끝 정렬을 사용합니다.

## Public API

```tsx
<Carousel.Root
  aria-label="매거진 배너"
  defaultIndex={0}
  onIndexChange={setIndex}
>
  <Carousel.Viewport className="aspect-[353/160]">
    <Carousel.Track>
      <Carousel.Item>
        <a href="/magazines/1">
          <img src={src} alt="매거진 제목" />
        </a>
      </Carousel.Item>

      <Carousel.Item>
        <a href="/magazines/2">
          <img src={src} alt="매거진 제목" />
        </a>
      </Carousel.Item>
    </Carousel.Track>
  </Carousel.Viewport>

  <Carousel.Indicator />
</Carousel.Root>
```

Text overlay와 하단 끝 indicator가 필요한 경우:

```tsx
<Carousel.Root aria-label="오늘의 해시 Pick">
  <Carousel.Viewport className="aspect-[393/234]">
    <Carousel.Track>
      <Carousel.Item>
        <a href="/magazines/today-pick" className="relative block size-full">
          <img src={src} alt="" className="size-full object-cover" />
          <div className="absolute bottom-8 left-6">
            <p>오늘의 해시 Pick</p>
            <p>짧은 매거진에 대한 소개를 넣어보기</p>
          </div>
        </a>
      </Carousel.Item>

      <Carousel.Item>
        <a href="/magazines/next-pick" className="relative block size-full">
          <img src={nextSrc} alt="" className="size-full object-cover" />
          <div className="absolute bottom-8 left-6">
            <p>이번 주 Pick</p>
            <p>새로운 매거진 소개를 넣어보기</p>
          </div>
        </a>
      </Carousel.Item>
    </Carousel.Track>
  </Carousel.Viewport>

  <Carousel.Indicator align="end" />
</Carousel.Root>
```

Exported value:

- `Carousel`

Exported types:

- `CarouselRootProps`
- `CarouselViewportProps`
- `CarouselTrackProps`
- `CarouselItemProps`
- `CarouselIndicatorProps`
- `CarouselIndicatorAlign`

## UI Structure

```text
Carousel.Root
  Carousel.Viewport
    Carousel.Track
      Carousel.Item
        app content
      Carousel.Item
        app content
  Carousel.Indicator
    dot list
```

## Props

### `Carousel.Root`

- `index`: `number`, optional controlled current index
- `defaultIndex`: `number`, optional uncontrolled initial index, default `0`
- `onIndexChange`: `(index: number) => void`, optional
- `className`: `string`, optional
- `aria-label`: `string`, optional
- `aria-labelledby`: `string`, optional
- `children`: `ReactNode`, required

`Carousel.Root`는 `aria-label` 또는 `aria-labelledby` 중 하나를 받아야 합니다.

### `Carousel.Viewport`

- native `div` props
- `className`: viewport class와 병합
- children: `Carousel.Track`

### `Carousel.Track`

- native `div` props
- `className`: track class와 병합
- children: `Carousel.Item`

### `Carousel.Item`

- native `div` props
- `className`: item class와 병합
- children: 호출부 content

### `Carousel.Indicator`

- native `div` props
- `align`: `'center' | 'end'`, optional, default `'center'`
- `className`: wrapper class와 병합
- `dotClassName`: dot class와 병합
- `activeDotClassName`: active dot class와 병합

## States

- uncontrolled: internal index starts from `defaultIndex`.
- controlled: `index` controls current slide.
- idle: user is not scrolling.
- scrolling: viewport scroll position is changing.
- settled: nearest slide index is calculated and `onIndexChange` is called when changed.
- single item: indicator is not rendered.
- reduced motion: programmatic movement avoids smooth animation when the user prefers reduced motion.

## Behavior

1. `Carousel.Root` initializes current index from `index` or `defaultIndex`.
2. `Carousel.Viewport` renders a horizontal scroll container.
3. `Carousel.Track` lays out items in a row.
4. `Carousel.Item` occupies `100%` of the viewport width and snaps to the viewport start.
5. The user moves slides through native touch, touch screen, or trackpad horizontal scroll.
6. When scroll settles, Carousel calculates the nearest item and updates the current index.
7. If the calculated index changes, `onIndexChange` is called.
8. If controlled `index` changes from outside, Carousel scrolls the matching item into view.
9. `Carousel.Indicator` reflects the current index.
10. If there is 0 or 1 item, `Carousel.Indicator` renders nothing.

## Styling

- root: `relative w-full`
- viewport: `w-full overflow-x-auto`
- track: `h-full` horizontal flex row
- item: `h-full min-w-0 flex-[0_0_100%]`
- snap: viewport uses `snap-x snap-mandatory`, item uses `snap-start`
- scrollbar: visually hidden while preserving scroll behavior
- indicator: absolute bottom overlay by default
- `Carousel.Viewport`는 x축 scroll 동작이 깨지지 않도록 `overflow-x-auto`를 필수 동작 class로 유지합니다.
- clipping이 필요하면 `overflow-y-hidden` 또는 item 내부 clipping을 사용합니다.
- indicator align center: horizontal center
- indicator align end: right side in the current LTR layout
- active dot: elongated pill shape
- inactive dot: small circular dot
- indicator color: existing HDS gray tokens, not raw hex values
- size and ratio: caller sets on `Carousel.Viewport` through `className`
- padded example: page section owns horizontal padding, carousel fills parent width
- full-width example: carousel root fills viewport or parent width

Figma example mapping:

```tsx
<section className="px-5">
  <Carousel.Root aria-label="매거진 배너">
    <Carousel.Viewport className="aspect-[353/160]">
      {/* slides */}
    </Carousel.Viewport>
    <Carousel.Indicator />
  </Carousel.Root>
</section>
```

```tsx
<Carousel.Root aria-label="프로모션 배너">
  <Carousel.Viewport className="aspect-[393/234]">
    {/* slides */}
  </Carousel.Viewport>
  <Carousel.Indicator />
</Carousel.Root>
```

## Accessibility

- `Carousel.Root` renders a labeled region.
- `Carousel.Root` has `role="region"` and `aria-roledescription="carousel"`.
- `Carousel.Root` requires `aria-label` or `aria-labelledby`.
- `Carousel.Item` has `role="group"` and `aria-roledescription="slide"`.
- `Carousel.Item` exposes position text such as `1 / 5` through `aria-label`.
- image `alt` belongs to the caller.
- interactive content inside a slide keeps its native focus behavior.
- indicator dots are not buttons in v1, are not focusable, and are hidden from assistive technology.
- keyboard arrow navigation is not provided in v1.
- implementation respects `prefers-reduced-motion` for programmatic scrolling.

## Dependencies

- external carousel library: none
- `react-aria-components`: not required for v1
- existing HDS utility: `cn`

## Storybook

- [x] Default image text overlay banner, `393 / 260`
- [x] Padded magazine banner, `353 / 160`
- [x] Full-width image area, `393 / 234`
- [x] Text overlay banner with end-aligned indicator
- [x] Swipe interaction with visually distinct slides
- [x] Single item without indicator
- [x] Controlled index
- [x] Interactive child content
- [x] Custom indicator classes
- [x] Mobile viewport wrapper
- [x] Long or non-image content overflow check

## HDS가 가지면 안 되는 것

- 실제 route 이동
- Next / React Router 의존성
- `href`, `Link`, `asChild` API
- WebView bridge 호출
- 로그인 여부 판단
- 권한에 따른 carousel 노출 판단
- 매거진 / 예약 / 리뷰 / 결제 같은 도메인 데이터 하드코딩
- API query, mutation, cache invalidation
- analytics event 전송
- browser back button 정책
- safe area inset 직접 적용
- app shell padding 결정
- section spacing 결정
- text overlay 전용 slot
- slide click action props
- async loading / server error 처리
- 이미지 placeholder, fallback, skeleton 소유
- 앱 전용 copy 하드코딩
- autoplay
- infinite loop
- mouse drag-to-scroll

## 구현 메모

- 기본 형태는 모바일 WebView/PWA 기준 swipe carousel입니다.
- CSS scroll-snap을 우선하고, transform 기반 custom swipe engine은 도입하지 않습니다.
- viewport는 parent width를 채우며, full-bleed 여부는 호출부 layout이 결정합니다.
- `Carousel.Viewport`의 비율은 호출부 `className`으로 지정합니다.
- `Carousel.Item`은 viewport 너비 기준 100%를 유지합니다.
- slide 안의 `img`는 호출부가 `size-full`, `object-cover`, `object-contain` 등으로 결정합니다.
- slide 안의 text overlay, gradient overlay, CTA는 호출부가 children으로 구성합니다.
- 디자이너 답변 기준 이미지는 매거진에서 제공되는 비율 그대로 사용하므로 HDS가 `cover` / `contain` 정책을 고정하지 않습니다.
- indicator는 item이 2개 이상일 때만 렌더링합니다.
- indicator dot은 현재 위치 표시만 하며 클릭 interaction을 제공하지 않습니다.
- indicator는 기본 하단 중앙 정렬이고, text overlay와 함께 쓰는 배너에서는 `align="end"`로 하단 끝 정렬을 사용합니다.
- active dot은 Figma 예시처럼 inactive dot보다 긴 pill 형태를 기본으로 합니다.
- controlled `index` 변경 같은 programmatic 이동은 native smooth scroll 기준으로 처리하되, native swipe는 브라우저의 스크롤 동작을 따릅니다.
- reduced motion 환경에서는 programmatic 이동을 즉시 처리합니다.
- scroll settle 계산은 item width와 viewport scroll position을 기준으로 합니다.
- resize 후에도 현재 index가 유지되도록 viewport 기준 위치를 다시 맞춥니다.
- `defaultIndex`와 controlled `index`가 item 범위를 벗어나면 사용 가능한 범위로 보정합니다.
- slide 개수가 동적으로 바뀌면 현재 index도 새 item 개수 안으로 보정합니다.

## Verification

- [ ] `corepack pnpm format:check`
- [ ] `git diff --check`
- [ ] `bash .agents/scripts/check-harness.sh`
- [ ] `corepack pnpm --filter @hashi/hds-ui lint`
- [ ] `corepack pnpm --filter @hashi/hds-ui typecheck`
- [ ] `corepack pnpm --filter @hashi/hds-ui build`
- [ ] `corepack pnpm --filter @hashi/hds-ui test`
