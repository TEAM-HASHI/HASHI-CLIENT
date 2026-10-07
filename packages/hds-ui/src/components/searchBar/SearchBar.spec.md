# Component Spec: `SearchBar`

Jira: HASHI-218

## Purpose

검색 입력과 입력값 지우기를 제공하는 HDS primitive입니다. 검색 실행, 라우팅, 추천 검색어, 필터와 API 요청은 호출부가 소유합니다.

## Figma References

- [검색 입력 및 X 버튼](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=6977-62334&m=dev)
- 개발에서 정한 `SearchBar` 이름을 유지합니다. `SearchField`와 `SearchFieldProps`는 호환 alias입니다.
- 뒤로가기 버튼은 호출부에서 `IconButton`과 조합합니다.

## Public API

```tsx
<SearchBar
  aria-label="검색"
  value={keyword}
  onChange={(event) => setKeyword(event.target.value)}
  onClear={() => setKeyword('')}
/>
```

- native input props와 ref를 지원하며 type은 search로 고정합니다.
- `icon`: 검색 아이콘 표시 여부, 기본 true.
- `className`: 바깥 영역, `inputClassName`: input 스타일 확장.
- `onClear`: 지우기 요청 콜백. 제어형 입력에서는 부모가 빈 문자열로 상태를 변경합니다.
- 비제어형 입력은 defaultValue로 초기화하고 입력·지우기 상태를 내부에서 관리합니다.
- 비제어형 input은 native defaultValue를 유지합니다. form.reset() 후 입력값과 X 버튼 상태를 동기화하며, preventDefault로 취소된 reset은 반영하지 않습니다.
- ref는 실제 input에 연결하며 callback ref의 cleanup을 보존합니다. 입력값 변경만으로 ref를 재연결하지 않습니다.
- 지우기는 onChange로 가장한 이벤트를 만들지 않으며 onClear만 호출합니다.

## States And Behavior

- 입력값이 있고 수정 가능할 때 X 버튼을 표시합니다.
- 제어형 입력에 onClear가 없으면 동작하지 않는 버튼을 노출하지 않습니다.
- disabled 또는 readOnly 상태에는 X 버튼을 표시하지 않습니다.
- X 버튼은 type=button으로 폼을 제출하지 않으며, 클릭 후 input으로 포커스를 복원합니다.
- 부모가 값을 변경하지 않으면 제어형 입력의 기존 값을 유지합니다.
- native 검색 취소 버튼은 숨겨 X 버튼과 중복되지 않도록 합니다.

## Styling And Accessibility

- w-full, 높이 45px, radius 10px, primary-100 배경, 좌우 여백 12px.
- 상태 전환으로 배경색을 변경하지 않습니다.
- 검색·지우기 아이콘은 HDS SearchIcon·CancelIcon, 각각 24px. 아이콘과 입력 간격은 8px입니다.
- Body 4, 본문 black, placeholder warm-gray-300.
- input은 min-w-0, flex-1이며 아이콘과 버튼은 축소하지 않습니다.
- aria-label은 필수이며 X 버튼의 접근성 이름은 검색어 지우기입니다.
- 지우기 버튼의 키보드 focus-visible 표시는 IconButton의 기존 계약을 유지합니다.

## Storybook And Verification

Default, WithValue, WithoutIcon, Disabled, FocusState, 긴 입력·placeholder, 좁은 화면, Controlled, Uncontrolled, FormReset 상태를 확인합니다.

자동 테스트는 제어형·비제어형 초기화, 부모 상태 유지, 폼 제출 방지, 포커스 복원, 폼 reset·취소 및 callback ref 생명주기를 검증합니다. 단순 스타일 클래스와 조건별 버튼 표시 테스트는 두지 않습니다.
