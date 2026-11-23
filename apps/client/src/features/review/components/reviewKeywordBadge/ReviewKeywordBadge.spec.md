# Component Spec: `ReviewKeywordBadge`

## Purpose

- 식당 상세 리뷰와 마이 리뷰 상세에서 동일한 키워드 칩 표현을 사용한다.
- 백엔드의 리뷰 키워드 code, label 또는 클라이언트 id를 같은 키워드로 해석해 아이콘과 정식 문구를 표시한다.

## Public API

```tsx
<ReviewKeywordBadge keyword="STAFF_IS_KIND" />
<ReviewKeywordBadge keyword="직원분이 친절해요" />
```

- `keyword`: 백엔드 keyword code, label 또는 `ReviewKeywordId`
- `className`: 표시 위치의 디자인에 필요한 스타일을 전달한다. HASHI-264 식당 리뷰 목록·사진 상세는 Figma 높이 32px(`h-8`)을 적용하며 다른 호출부의 기본 높이는 유지한다.
- 알려진 키워드는 `features/review/constants` 기준의 아이콘과 label을 표시한다.
- 알 수 없는 키워드는 아이콘 없이 받은 문구를 그대로 표시한다.
- route, API, query, mutation은 소유하지 않는다.

## Visual Contract

- HDS `Badge` 정적 variant를 사용한다.
- 아이콘은 `24px`, 테두리는 `warm-gray-100`, radius는 `5px`로 표시한다.
- 식당 리뷰 목록·사진 상세의 확정 높이 외에 padding·아이콘·label을 임의로 override하지 않는다.

## Verification

- 정식 API keyword 10개가 모두 아이콘과 함께 표시되는지 확인한다.
- 식당 상세와 마이 리뷰 상세가 이 컴포넌트를 사용하는지 확인한다.
