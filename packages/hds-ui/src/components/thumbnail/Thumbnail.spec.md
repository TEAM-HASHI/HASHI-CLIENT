# Thumbnail

## 목적

`Thumbnail`은 목록과 요약 영역에서 사용하는 정사각형 이미지와 fallback 상태를 공통으로 렌더링합니다.

## Props

- `src`: 이미지 URL. 없거나 로딩에 실패하면 `ImageFallback`을 표시합니다.
- `alt`: 이미지 대체 텍스트입니다.
- `size`: `sm | md | lg`, 기본값은 `sm`입니다.
- 그 외 표준 `img` 속성을 전달할 수 있습니다.

## Size

- `sm`: 60px
- `md`: 92px
- `lg`: 135px

모든 크기에 `5px` radius와 `object-cover`를 적용합니다.

## 책임 경계

- 상세 이미지나 고정 비율 이미지에는 사용하지 않습니다.
- 이미지 URL 유무와 로딩 실패 상태만 처리합니다.
- 도메인별 이미지 선택 및 문구 결정은 사용하는 영역이 담당합니다.

## 테스트

- 정상 이미지와 fallback 렌더링
- 이미지 로딩 실패 처리
- src 변경 시 오류 상태 초기화
- 크기 variant 적용
