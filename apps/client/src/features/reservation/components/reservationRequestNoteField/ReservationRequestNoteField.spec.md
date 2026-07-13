# ReservationRequestNoteField Spec

## Purpose

일반 예약과 어디든 예약 화면에서 동일하게 사용하는 요청사항 입력 UI와 1000자 제한 규칙을 한곳에서 관리한다.

## Scope

- HDS `Textarea`를 사용한다.
- `요청사항 (선택)` 라벨을 표시한다.
- 입력값과 변경 callback은 호출부가 소유하는 controlled contract로 제공한다.
- 입력과 붙여넣기는 최대 1000자까지만 허용한다.
- HDS counter를 사용해 현재 글자 수와 최대 글자 수를 `0/1000` 형태로 표시한다.
- 예약 화면에서 사용하기에 적합하도록 textarea 최소 높이를 약 140px로 조정한다.
- 기본 border는 HDS의 `warm-gray-100` 1px을 유지하고, focus 시 `primary-400` 1px border로 변경한다.
- HDS 기본 `cool-gray-500` 2px focus outline은 예약 화면에서 제거한다.
- API 호출, draft 생성, submit 가능 여부는 담당하지 않는다.

## Interface

```ts
interface ReservationRequestNoteFieldProps {
  value: string
  onValueChange: (value: string) => void
}
```

## Ownership

- 위치: `features/reservation/components/reservationRequestNoteField`
- 이유: 일반 예약 page와 어디든 예약 page가 같은 UI와 제한 규칙을 공유한다.
- 각 page의 form hook은 서로 다른 필수 필드와 draft 생성을 관리하므로 page-local로 유지한다.

## Behavior

1. 빈 값이면 counter는 `0/1000`이다.
2. 입력할 때마다 제한된 문자열을 `onValueChange`로 전달한다.
3. 키보드 입력과 붙여넣기 모두 1000자를 초과하지 않는다.
4. 외부 controlled value가 1000자를 넘더라도 HDS `Textarea`가 표시값을 1000자로 제한한다.
5. 요청사항은 선택 입력이므로 빈 값이어도 예약 submit 가능 여부에 영향을 주지 않는다.

## API Compatibility

프론트와 live OpenAPI 모두 요청사항 최대 길이를 1000자로 정의한다.

## Verification

- 라벨과 `0/1000` counter를 렌더링한다.
- 입력값 변경 callback을 호출한다.
- 1000자 초과 입력과 붙여넣기를 차단한다.
- 일반 예약과 어디든 예약 page가 공용 컴포넌트를 사용한다.
