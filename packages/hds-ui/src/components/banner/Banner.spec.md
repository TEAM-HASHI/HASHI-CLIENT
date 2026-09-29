# Component Spec: `Banner`

## Purpose

단일 이미지 배너의 비율, 모서리와 선택적 텍스트 오버레이를 제공하는 HDS primitive입니다.
`Carousel`은 여러 카드의 이동과 선택 상태를, `Carousel.Indicator`는 현재 위치 표시를 담당합니다.
이미지·문구·링크·API·로딩·오류·접근성 이름은 호출부가 소유합니다.

## Design References

- [Banner](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7869-36806&m=dev): `with text` / `without text`
- [컴포넌트 책임](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=7869-36834&m=dev)
- 확인한 세부 노드: 텍스트형 `7869:36825`, 그라데이션 `7869:36826`, 제목 `7869:36828`, 소제목 `7869:36830`, 인디케이터 `7869:36831`, 이미지형 인디케이터 `7869:36833`.

## Public API

- `Banner`, `BannerProps`를 package entry에서 export합니다.
- `imageSrc`, `imageAlt`: 필수 문자열. 장식 이미지는 `imageAlt=""`를 명시합니다.
- `variant`: `withoutText`(기본) 또는 `withText`.
- `withText`에는 `title`, `subtitle` 문자열이 필수입니다. `withoutText`는 문구를 받지 않습니다.
- `indicator`: 선택적 ReactNode. 비상호작용 위치 표시 또는 여백 슬롯입니다. 캐러셀에서는 실제 indicator를 Track 밖에 하나만 두고, 텍스트형 Banner의 이 슬롯에는 indicator 너비만큼의 빈 요소를 전달합니다.
- `className`과 native div props를 지원하며 `children`, native `title`은 제공하지 않습니다.
- 링크/버튼 역할이나 캐러셀 상태를 내부에서 만들지 않습니다. 호출부가 anchor로 감싸고 목적지와 접근성 이름을 제공합니다.

```tsx
<Carousel.Root aria-label="콘텐츠 배너">
  <Carousel.Viewport>
    <Carousel.Track>
      {banners.map((banner) => (
        <Carousel.Item key={banner.id}>
          <Banner
            imageSrc={banner.imageUrl}
            imageAlt=""
            variant="withText"
            title={banner.title}
            subtitle={banner.subtitle}
            indicator={
              banners.length > 1 ? (
                <span
                  aria-hidden="true"
                  className="shrink-0"
                  style={{
                    width: `${(12 + (banners.length - 1) * 11) / 16}rem`,
                  }}
                />
              ) : undefined
            }
          />
        </Carousel.Item>
      ))}
    </Carousel.Track>
  </Carousel.Viewport>
  <Carousel.Indicator align="end" className="right-5 bottom-5.75" />
</Carousel.Root>
```

## Styling / Responsive

- 기본 너비는 부모 100%, 비율은 `353:160`, 모서리는 `5px`, 이미지는 `object-cover`입니다. 페이지 padding/최대 너비는 호출부가 정합니다.
- 텍스트형: 전체 카드에 위 투명 → 아래 black 50% 그라데이션, white 텍스트.
- 제목: Header 1, 24px/600. 소제목: 12px/500. 현재 `typo-caption-1` 토큰은 400이므로 이 컴포넌트에서만 `font-medium`으로 Figma의 500을 반영합니다.
- 텍스트는 좌우 20px, 아래 18px, 제목/아래 줄 간격 4px입니다.
- 아래 줄은 소제목과 indicator를 flex로 배치하고 최소 간격 24px을 유지합니다. 네 항목의 indicator 너비는 45px이며, 소제목은 카드 내부에서 슬롯과 간격을 제외한 남은 너비를 사용합니다.
- 캐러셀의 실제 indicator는 배너 영역을 채우는 Root 기준 오른쪽 20px, 아래 23px에 고정합니다. Track/Item 안에 두지 않습니다. 이미지형 Banner에는 빈 슬롯도 필요하지 않습니다.
- 기본 indicator 여백은 활성 12px + 나머지 항목마다 dot 4px/간격 7px입니다. Tailwind spacing과 동일하게 rem으로 전달하고, dot 스타일을 바꾸면 호출부가 여백도 맞춥니다. 단일 항목에서는 indicator와 여백을 모두 생략합니다.
- Figma 고정 프레임의 비정상적인 `height:47px + padding-bottom:52px`는 복사하지 않고 실제 표시 위치와 간격을 따릅니다.
- 긴 제목/소제목은 한 줄 말줄임합니다. 소제목은 항목 수에 따라 남은 너비를 사용합니다. 280px 카드/6개 항목까지 확인합니다. 무제한 개수나 극단적으로 작은 카드까지 보장하지 않습니다.

## States / Accessibility

- 텍스트형/이미지형은 명시적 variant로 전환합니다.
- disabled/loading/error는 앱 책임이며 HDS에서 관련 문구나 대체 이미지를 생성하지 않습니다.
- 제목/설명은 문서의 heading 계층을 가정하지 않는 `p`입니다.
- 장식 그라데이션과 비상호작용 indicator는 보조기술에서 제외합니다.
- 키보드 이동/링크 접근성은 외부 anchor/button이 담당합니다. 이미지 alt나 링크 label을 실제 목적에 맞게 전달합니다.

## Verification

- Storybook: Default, WithText, LongText, LinkedBanner. Carousel stories에서 두 variant 조합, narrow, swipe, controlled, single item을 확인합니다.
- 단위 테스트: variant 변경 시 이전 문구 제거 및 이미지 교체, Track 밖 단일 indicator controlled 선택 동기화 및 단일 항목 숨김.
- HDS: `pnpm --filter @hashi/hds-ui lint`, `typecheck`, `build`, `test`, `build-storybook`.
- 앱: HomePage/MagazinesPage 기존 테스트, client lint/typecheck 및 홈·매거진 배너 확인.
