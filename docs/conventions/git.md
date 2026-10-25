# Git Convention

HASHI Client는 Jira로 작업을 관리하고 GitHub로 코드 리뷰와 병합을 관리합니다.

## GitHub Flow

1. Jira 티켓을 생성합니다.
2. Jira 티켓 번호를 기준으로 브랜치를 생성합니다.
3. 작업 브랜치에서 개발합니다.
4. 작업이 끝나면 `develop` 브랜치로 PR을 생성합니다.
5. 최소 1명 이상의 approve를 받은 뒤 merge합니다.
6. merge된 브랜치는 삭제합니다.

## 역할 분리

| 도구   | 역할                          |
| ------ | ----------------------------- |
| Jira   | 작업 관리, 이슈 관리          |
| GitHub | 코드 관리, 코드 리뷰, PR 관리 |

## 브랜치 운영

| 브랜치       | 역할                                      |
| ------------ | ----------------------------------------- |
| `main`       | 배포 가능한 브랜치                        |
| `develop`    | 기능 브랜치들이 병합되는 개발 기준 브랜치 |
| `init/*`     | 초기 세팅 작업                            |
| `feat/*`     | 새로운 기능 개발                          |
| `fix/*`      | 버그 수정                                 |
| `refactor/*` | 리팩토링                                  |
| `style/*`    | UI 스타일, CSS, 포맷팅 수정               |
| `docs/*`     | 문서 작성 및 수정                         |
| `test/*`     | 테스트 코드 및 테스트 환경 수정           |
| `deploy/*`   | 배포 설정 및 배포 관련 작업               |
| `chore/*`    | 빌드 설정, 패키지 관리, 기타 잡무         |

## Jira Type과 Git Prefix

Jira 이슈 제목의 Type과 브랜치 prefix는 같은 의미로 사용합니다.

| Jira Type  | Branch prefix | 사용 기준                          |
| ---------- | ------------- | ---------------------------------- |
| `INIT`     | `init`        | 프로젝트 초기 설정, 구조 세팅      |
| `FEAT`     | `feat`        | 새로운 기능 추가                   |
| `FIX`      | `fix`         | 버그 수정, 오류 해결               |
| `REFACTOR` | `refactor`    | 기능 변화 없는 코드 구조 개선      |
| `STYLE`    | `style`       | CSS, UI 스타일, 포맷팅 수정        |
| `DOCS`     | `docs`        | 문서 작성, README 수정, 주석 보강  |
| `TEST`     | `test`        | 테스트 코드 작성, 테스트 환경 수정 |
| `DEPLOY`   | `deploy`      | 배포 설정, 배포 관련 작업          |
| `CHORE`    | `chore`       | 빌드 설정, 패키지 관리, 기타 잡무  |

## 브랜치 컨벤션

```text
type/HASHI-번호-작업-요약
```

브랜치명은 다음 기준을 따릅니다.

- `type`은 Jira Type을 소문자로 작성합니다.
- Jira key는 `HASHI-번호` 형식을 유지합니다.
- 작업 요약은 영어 소문자와 하이픈을 사용합니다.

```text
init/HASHI-1-project-setting
feat/HASHI-12-login
fix/HASHI-18-button-style
refactor/HASHI-24-auth-logic
docs/HASHI-30-convention-docs
chore/HASHI-31-package-setting
```

## 작업 시작 방법

모든 작업은 `develop` 브랜치를 기준으로 시작합니다.

```bash
git checkout develop
git pull origin develop
```

그 후 Jira 티켓 번호를 기준으로 작업 브랜치를 생성합니다.

```bash
git checkout -b feat/HASHI-12-login
```

## 다른 작업 브랜치에서 새 브랜치를 만든 경우

다른 작업 브랜치에서 새 브랜치를 만들었다면, PR을 올리기 전에 반드시 `develop` 기준으로 rebase합니다.

```bash
git checkout feat/HASHI-12-login
git fetch origin
git rebase origin/develop
```

이 작업을 하지 않으면 이전 브랜치의 커밋까지 새 PR에 포함될 수 있습니다.

## Commit

### 로컬 검증

- `pre-commit`은 기존대로 스테이징된 파일에 `lint-staged`를 실행해 ESLint 및 Prettier를 자동 적용합니다.
- `pre-push`는 `pnpm verify`로 포맷, 전체 린트, 타입 검사, 클라이언트·HDS 테스트, 전체 빌드를 순서대로 실행합니다. 하나라도 실패하면 푸시를 차단합니다.
- 커밋 전에도 `pnpm verify`를 수동 실행할 수 있습니다. 푸시 훅은 자동 수정하지 않으며, 기존 Turbo 캐시를 사용합니다.
- Node.js 22와 저장소에 지정된 pnpm을 사용합니다. 설치 후 훅이 연결되지 않으면 `pnpm exec husky`를 실행합니다.
- 검증은 현재 작업 디렉터리 기준이므로 미커밋 변경 여부를 확인합니다. `--no-verify` 또는 `HUSKY=0`으로 검증을 우회하지 않습니다.
- E2E, CI 보조 테스트, Lighthouse, Chromatic, 배포 검증은 별도입니다. 로컬 검증이 통과해도 푸시 후 원격 CI 결과를 확인합니다.

세부 검증 기준은 `.agents/checklists/verification.md`를 따릅니다.

### 메시지 형식

커밋 메시지는 다음 형식을 사용합니다.

```text
type: HASHI-번호 작업 내용
```

커밋의 `type`은 소문자로 작성하고 `scope`는 붙이지 않습니다. PR 제목 규칙과 구분합니다.

예시는 다음과 같습니다.

```text
docs: HASHI-30 컨벤션 문서 추가
feat: HASHI-12 로그인 페이지 구현
fix: HASHI-18 Button disabled 스타일 수정
chore: HASHI-31 pnpm workspace 설정 수정
```

관련 없는 변경이면 커밋을 나눕니다.

## PR 생성 기준

작업이 완료되면 `develop` 브랜치로 PR을 생성합니다.

PR 제목은 다음 형식을 사용합니다.

```text
Type(scope): HASHI-번호 작업 내용
```

PR의 `Type`은 첫 글자만 대문자로 작성하고, `scope`와 Jira key를 반드시 포함합니다. `scope`는 기능명(`auth`, `button` 등)이나 파일 경로 대신 변경 대상의 짧은 이름을 사용합니다.

| Scope        | 사용 기준                              |
| ------------ | -------------------------------------- |
| `client`     | 클라이언트 앱                          |
| `admin`      | 어드민 앱                              |
| `hds-ui`     | HDS UI 패키지                          |
| `hds-icons`  | HDS 아이콘 패키지                      |
| `hds-tokens` | HDS 토큰 패키지                        |
| `root`       | 저장소 공통 설정, 패키지 관리, 검증 훅 |
| `tsconfig`   | 공통 TypeScript 설정                   |
| `turbo`      | Turbo 설정 및 generator                |
| `docs`       | 문서                                   |
| `github`     | GitHub workflow 및 template            |

여러 영역을 변경하면 PR의 주요 목적에 맞는 scope를 선택하고, 나머지 범위는 본문에 설명합니다.

예시는 다음과 같습니다.

```text
Init(root): HASHI-17 Tailwind CSS 초기 세팅
Feat(client): HASHI-24 로그인 페이지 구현
Fix(hds-ui): HASHI-31 버튼 클릭 이벤트 오류 수정
Refactor(client): HASHI-42 인증 로직 분리
Feat(admin): HASHI-233 공지사항 관리 API 연동
Chore(root): HASHI-242 푸시 전 통합 검증 훅 추가 및 검증 절차 보완
```

PR 본문은 `.github/pull_request_template.md`를 기준으로 작성하고, 관련 Jira 티켓 번호를 명시합니다. `apps/client/**` PR은 `docs/workflows/testing.md`의 테스트 근거와 `docs/workflows/code-review.md`의 리뷰어 1명 지정 기준을 함께 따릅니다.

```markdown
## 📌 요약

로그인 페이지를 구현했습니다.

Jira: HASHI-12

## 📚 작업 내용

- 로그인 페이지 UI 구현
- 로그인 폼 입력 상태 처리
- 로그인 요청 연결 지점 구성

## ✅ 검증

- [x] 자동 테스트: `pnpm --filter @hashi/client test`
- [x] 수동 확인: 로그인 성공·실패·disabled 상태
```

## PR Template

현재 저장소의 PR 템플릿은 다음 형식을 사용합니다. 상세 운영 규칙은 `docs/workflows/pr-checklist.md`를 확인합니다.

```markdown
## 📌 요약

_작업 내용을 간단히 요약해주세요._

Jira: HASHI-

## 📚 작업 내용

- _해당 PR에 수행한 작업을 설명해주세요._

## 🔎 상세 설명

_구현 방식, 설계 의도, 사용 예시 등 리뷰 전에 알아야 할 맥락을 작성해주세요._

## 💭 고민한 부분

### 고민한 문제

-

### 고려한 선택지

-

### 최종 선택과 이유

-

### 남은 고민

-

## ✅ 검증

<!-- 해당 없는 항목은 삭제하거나 "해당 없음"으로 작성해주세요. -->

- [ ] 자동 테스트:
- [ ] 수동 확인:
- [ ] 테스트 생략 사유:

<!--
## 👀 리뷰어에게

_집중해서 확인해 줄 구조, 정책, 예외 케이스를 작성해주세요._
-->

<!--
## 📸 스크린샷

(기재 내용 없을 경우 섹션 삭제) 작업한 내용에 대한 스크린샷을 첨부해주세요.
-->
```

## Merge 후 브랜치 관리

- merge가 완료된 브랜치는 삭제합니다.
- 이미 merge된 브랜치에서 새로운 작업을 이어서 하지 않습니다.
- 새로운 작업은 항상 `develop` 기준으로 새 브랜치를 생성합니다.

## 충돌 해결 방법

작업 브랜치가 `develop`과 충돌나는 경우, `develop` 기준으로 rebase 하면서 충돌을 해결합니다.

1. 최신 `develop`을 가져옵니다.

```bash
git checkout develop
git pull origin develop
```

2. 작업 브랜치로 이동합니다.

```bash
git checkout feat/HASHI-12-login
```

3. `develop` 기준으로 rebase를 실행합니다.

```bash
git rebase develop
```

4. 충돌이 발생하면 Git이 충돌난 파일을 알려줍니다.

```bash
git status
```

5. 충돌난 파일을 열어 아래 표시를 확인합니다.

```text
`<<<<<<< HEAD`
develop 브랜치의 코드
`=======`
내 작업 브랜치의 코드
`>>>>>>> feat/HASHI-12-login`
```

6. 필요한 코드만 남기고 충돌 표시를 삭제합니다.

```text
최종으로 남길 코드
```

7. 수정이 끝나면 충돌 해결한 파일을 stage 합니다.

```bash
git add 충돌난파일경로
```

8. rebase를 계속 진행합니다.

```bash
git rebase --continue
```

9. 충돌이 여러 번 발생하면 같은 과정을 반복합니다.
10. rebase가 완료되면 원격 브랜치에 push 합니다.

```bash
git push --force-with-lease origin feat/HASHI-12-login
```

## 충돌 해결 주의사항

- 충돌 표시인 `<<<<<<<`, `=======`, `>>>>>>>`는 반드시 삭제합니다.
- 확신이 없으면 충돌난 파일을 혼자 판단하지 말고 작성자에게 확인합니다.
- rebase 중 작업을 취소하고 싶다면 아래 명령어를 사용합니다.

```bash
git rebase --abort
```

- 이미 PR을 올린 브랜치에서 rebase를 했다면 push 시 `--force-with-lease`를 사용합니다.
- `--force` 대신 `--force-with-lease`를 사용합니다.
