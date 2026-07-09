# Empty

## Purpose

`Empty`는 리스트나 콘텐츠가 비어 있을 때 공통 그래픽, 안내 문구, CTA 버튼을 보여주는 shared UI 컴포넌트입니다.

같은 empty graphic을 사용하되 화면별로 설명 문구와 버튼 액션만 달라지는 경우에 사용합니다.

## Props

| Prop          | Type         | Required | Description                       |
| ------------- | ------------ | -------- | --------------------------------- |
| `description` | `ReactNode`  | yes      | empty 상태에서 보여줄 안내 문구   |
| `actionLabel` | `string`     | yes      | CTA 버튼 텍스트                   |
| `onAction`    | `() => void` | yes      | CTA 버튼을 눌렀을 때 실행할 함수  |
| `className`   | `string`     | no       | 사용처 레이아웃 조정을 위한 class |

## Usage Policy

- 리스트 결과가 0개인 화면에서 사용합니다.
- 그래픽 이미지는 컴포넌트 내부에서 `empty.webp`를 사용합니다.
- 버튼이 없는 단순 empty state가 필요해지면 별도 variant 또는 optional action 정책을 다시 논의합니다.
- 화면별 세로 배치나 남는 영역 중앙 정렬은 `className`으로 조정합니다.

## Example

```tsx
<Empty
  description={
    <>
      가고 싶은 맛집을 찾아
      <br />
      Hashi에게 예약을 맡겨보세요!
    </>
  }
  actionLabel="일본 맛집 추천받기"
  onAction={handleRecommendPress}
/>
```
