# Mobile WebView

HASHI Mobile (`apps/mobile`)은 Expo 기반 iOS/Android 앱입니다. 단일 WebView에서 기존 HASHI 웹을 표시하며, 웹 화면과 내비게이션은 변경하지 않습니다.

## Current Scope

- HTTPS 웹 주소 설정, 로딩·오류 안내와 재시도
- 설치 앱 시작 시 iOS는 네이티브 로고, Android는 흰 배경을 표시합니다. RN 스플래시에서 로고와 문구를 약 3초 보여준 뒤 페이드아웃합니다.
- 같은 출처의 일반 이동은 WebView 안에서 처리하고, 외부 HTTPS·전화·메일 링크와 새 창은 OS에 전달
- iOS TestFlight용 EAS 프로젝트 연결, Apple 배포 서명 및 내부 테스트 배포 완료
- Android 실기기용 QA APK 빌드, Google Play 내부 테스트는 후속 작업
- 앱 뒤로가기 브리지, 스와이프, 네이티브 인증 및 운영 배포는 후속 작업

## Run

저장소 루트에서 실행합니다.

```sh
pnpm install --frozen-lockfile
cp apps/mobile/.env.example apps/mobile/.env.local
pnpm dev:mobile
```

`EXPO_PUBLIC_WEB_URL`에는 폰에서 접근할 수 있는 HTTPS 주소만 설정합니다. 공개 환경변수이므로 비밀 값을 넣지 않습니다. 예시 파일은 QA 웹을 가리킵니다. 로컬 웹을 연결하려면 별도로 접근 가능한 HTTPS 주소가 필요합니다.

## TestFlight

`testflight` 프로필은 QA 웹을 연결한 iOS 스토어용 빌드를 만듭니다. EAS 팀 프로젝트는 `@jyeon03s-team/hashi-mobile`이며, 업로드 대상은 App Store Connect의 HASHI 앱(`kr.hashi.app`)입니다. 빌드와 업로드는 필요할 때 `apps/mobile`에서 각각 실행합니다.

```sh
pnpm dlx eas-cli@latest build --platform ios --profile testflight
pnpm dlx eas-cli@latest submit --platform ios --profile testflight
```

Apple의 빌드 처리가 끝나면 App Store Connect의 `HASHI 내부 테스트` 그룹에 빌드를 추가합니다. 이 프로필은 운영 웹 배포나 App Store 심사 제출에 사용하지 않습니다.

첫 빌드 `0.1.0 (1)`을 TestFlight로 iPhone에 설치해 홈 화면 아이콘, 약 3초 뒤 페이드아웃하는 스플래시, QA 웹 첫 화면과 식당 상세 진입을 확인했습니다.

## Android QA

`android-qa` 프로필은 동일한 EAS 팀 프로젝트에서 QA 웹을 연결한 APK를 만듭니다. 패키지 이름은 `kr.hashi.app`이며, 빌드는 `apps/mobile`에서 실행합니다.

```sh
pnpm dlx eas-cli@latest build --platform android --profile android-qa
```

빌드가 끝나면 EAS 빌드 페이지를 Android 기기에서 열고 APK를 내려받아 설치합니다. APK 직접 설치에는 Google Play Console 등록이나 신원 승인이 필요하지 않습니다. 이 프로필은 Play 스토어 제출용이 아닙니다.

iOS·Android 서명은 EAS에서 관리합니다. 별도로 내려받은 서명 키나 `credentials.json`은 커밋하지 않습니다.

## Verify

- `pnpm verify`는 모바일 lint, 타입 검사, URL 처리 테스트 및 iOS/Android JS 번들 생성을 포함합니다.
- Expo Go에서는 같은 네트워크에서 QR을 열거나, Android 에뮬레이터가 켜져 있을 때 개발 서버에서 `a`를 눌러 웹 첫 화면을 확인합니다. SDK 호환 Expo Go가 필요합니다.
- 스플래시 이미지, 유지 시간과 페이드아웃은 Expo Go에서 확인하지 않고 iOS/Android 릴리스 빌드의 최초 실행에서 확인합니다.
- `pnpm build:mobile`은 JS 번들을 생성하며 설치용 바이너리를 만들지 않습니다.
