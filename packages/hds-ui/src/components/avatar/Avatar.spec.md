# Avatar

Jira: HASHI-54

## 목적

`Avatar`는 사용자 프로필 이미지를 공통으로 렌더링하는 HDS UI primitive입니다.

HDS는 이미지 표시, 원형 placeholder, size, 기본 접근성 계약만 담당합니다. 사용자 이름 해석, nickname 첫 글자 fallback, ProfileLabel 조합, route, API, analytics는 App 또는 page/feature가 처리합니다.

## Props

### `src`

- type: `string`
- required: `false`
- description: 프로필 이미지 URL입니다. 값이 있으면 `img`를 렌더링합니다.

### `alt`

- type: `string`
- required: `false`
- description: 이미지 대체 텍스트입니다. 전달하지 않으면 `alt=""`로 처리합니다.

### `size`

- type: `'sm' | 'md' | 'lg'`
- required: `false`
- default: `sm`
- description: Avatar 크기입니다.

### `className`

- type: `string`
- required: `false`
- description: root element에 병합할 class입니다.

## Size

- `sm`: `40px` (`h-10 w-10`)
- `md`: `42px` (`h-[42px] w-[42px]`)
- `lg`: `90px` (`h-[90px] w-[90px]`)

## Figma 근거

- 리뷰 프로필 Avatar: `40px`
- 프로필 수정 Avatar: `42px`
- 게스트/큰 프로필 Avatar: `90px`

## 40px / 42px 정책

Figma에서 리뷰 프로필 Avatar는 40px, 프로필 수정 영역 Avatar는 42px로 확인되어 우선 각각 `sm`, `md` size로 반영합니다.

추후 디자인 시스템에서 40px로 통일하기로 결정되면 `md` size는 제거하거나 alias 처리할 수 있습니다.

## 상태

- image: `src`가 있으면 원형 `img`를 렌더링합니다.
- placeholder: `src`가 없으면 기본 원형 placeholder를 렌더링합니다.

## fallback 정책

`src`가 없으면 기본 원형 placeholder를 렌더링합니다.

이름 첫 글자 fallback은 기획/디자인 정책이 확정되지 않았으므로 구현하지 않습니다. Figma의 체크무늬 원형은 투명 배경 표시일 가능성이 있으므로 실제 fallback 디자인으로 단정하지 않습니다.

## 접근성

- `src`가 있으면 `img`를 렌더링하고 `alt`를 전달할 수 있습니다.
- `alt`가 전달되지 않으면 `alt=""`로 처리합니다.
- 장식용 Avatar는 `alt=""`를 허용합니다.
- placeholder는 의미 있는 이미지가 아니므로 `aria-hidden="true"`를 적용합니다.

## Storybook 상태

- Default
- WithImage
- Placeholder
- Small
- Medium
- Large

## 테스트 목록

- 이미지 렌더링
- alt 적용
- placeholder 렌더링
- size class 적용
- className 병합
