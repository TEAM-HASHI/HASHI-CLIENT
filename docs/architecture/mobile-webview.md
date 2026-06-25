# Mobile WebView

현재 HASHI Client에는 React Native 또는 WebView 앱 workspace가 없습니다.

## Current Scope

- 실행 앱은 `apps/client` 하나입니다.
- `apps/mobile`은 존재하지 않습니다.
- 웹 build 성공을 mobile 검증으로 간주할 필요가 없습니다.
- mobile 관련 명령이나 CI를 추가하지 않습니다.

## When Mobile Is Introduced

Mobile WebView가 실제로 필요해지면 별도 티켓에서 다음 항목을 함께 추가합니다.

- `apps/mobile` workspace
- mobile package scripts
- Android/iOS 실행 명령
- mobile 전용 검증 절차
- mobile 관련 `.gitignore`
- WebView와 web app 사이의 URL, bridge, 인증 경계 문서

## Agent Rule

agent는 HASHI Client 작업 중 mobile 앱이 있다고 가정하지 않습니다.
사용자가 mobile 작업을 명시하거나 `apps/mobile`이 실제로 추가된 뒤에만 mobile 경로를 다룹니다.
