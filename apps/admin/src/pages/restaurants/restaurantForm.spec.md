# Restaurant Form Spec

Jira: HASHI-211

## Purpose

관리자 식당 등록·수정 폼의 입력 검증과 API 요청 변환을 관리한다.

## Hashtags

- 기준: HASHI-PLAN `02_PRODUCT_SPEC/RESTAURANT/RESTAURANT_SEARCH/RESTAURANT_SEARCH.md` §4.5.
- 등록 및 해시태그 교체 시 1~3개를 허용한다. 수정에서 교체하지 않으면 기존 값을 보존한다.
- 쉼표로 분리하고 각 항목 양끝 공백을 제거한다. 빈 항목은 제외한다.
- 각 항목은 20자 이하의 한글·영문·숫자로 입력하며 `#`, 내부 공백, 이모지는 허용하지 않는다.
- 대소문자를 구분하지 않고 중복을 거부한다.
- API payload는 trim한 원문 표기를 유지하며 `#`를 붙이지 않는다.
- 오류 시 폼 제출을 막고 입력 제한을 안내한다.

## Verification

- `restaurantForm.test.ts`: 최대 개수·길이, 허용 문자, 중복, 정상 payload 검증.
- 기존 식당 이미지 미리보기와 API 변환 테스트를 함께 실행한다.
