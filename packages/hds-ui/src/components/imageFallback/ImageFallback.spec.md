# ImageFallback

## 목적

`ImageFallback`은 이미지가 없거나 로딩에 실패한 영역에 표시하는 공통 HDS fallback입니다.

이미지 요청과 오류 상태는 사용하는 컴포넌트가 관리하며, `ImageFallback`은 배경과 HASHI 마크를 렌더링하는 역할만 담당합니다.

## 스타일

- background: `warm-gray-50`
- mark: `HashiMarkIcon`, `primary-100`
- mark size: `sm | md | lg | xl`

## 접근성

- 의미 있는 이미지 대체 UI라면 `role="img"`와 `aria-label`을 전달합니다.
- 장식용이라면 `aria-hidden="true"`를 전달합니다.

## 테스트

- fallback 배경과 HASHI 마크 렌더링
- 접근성 라벨 전달
- className 병합
