# Git Convention

HASHI Client는 Jira로 작업을 관리하고 GitHub로 코드 리뷰와 병합을 관리합니다.

## GitHub Flow

1. Jira 티켓을 생성합니다.
2. Jira 티켓 번호를 기준으로 브랜치를 생성합니다.
3. 작업 브랜치에서 개발합니다.
4. 작업이 끝나면 `develop` 브랜치로 PR을 생성합니다.
5. 최소 2명 이상의 approve를 받은 뒤 merge합니다.
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

커밋 메시지는 다음 형식을 사용합니다.

```text
type(scope): HASHI-번호 작업 내용
```

`scope`는 변경된 workspace 또는 repo surface를 적습니다.

| Scope                | 사용 기준                                                    |
| -------------------- | ------------------------------------------------------------ |
| `root`               | 루트 설정, package manager, Turborepo, repo-wide config 변경 |
| `apps/client`        | 클라이언트 앱 변경                                           |
| `packages/hds-ui`    | HDS UI 컴포넌트 패키지 변경                                  |
| `packages/hds-icons` | HDS Icon 패키지 변경                                         |
| `configs/tsconfig`   | 공통 TypeScript 설정 변경                                    |
| `turbo`              | Turbo generator, Turborepo 설정 변경                         |
| `docs`               | `docs/*` 문서 변경                                           |
| `github`             | `.github/*` template, workflow 변경                          |

예시는 다음과 같습니다.

```text
docs(docs): HASHI-30 컨벤션 문서 추가
feat(apps/client): HASHI-12 로그인 페이지 구현
fix(packages/hds-ui): HASHI-18 Button disabled 스타일 수정
chore(root): HASHI-31 pnpm workspace 설정 수정
```

여러 surface가 함께 바뀌는 경우 가장 중요한 변경 범위를 scope로 잡고, 나머지는 본문에 적습니다. 관련 없는 변경이면 커밋을 나눕니다.

## PR 생성 기준

작업이 완료되면 `develop` 브랜치로 PR을 생성합니다.

PR 제목은 다음 형식을 사용합니다.

```text
Type(scope): 작업 내용
```

예시는 다음과 같습니다.

```text
Init(project): Tailwind CSS 초기 세팅
Feat(auth): 로그인 페이지 구현
Fix(button): 버튼 클릭 이벤트 오류 수정
Refactor(auth): 인증 로직 분리
Style(input): Input 컴포넌트 스타일 수정
```

PR 본문은 `.github/pull_request_template.md`를 기준으로 작성하고, 관련 Jira 티켓 번호를 명시합니다.

```markdown
## 📌 Summary

로그인 페이지를 구현했습니다.

Jira: HASHI-12

## 📚 Tasks

- 로그인 페이지 UI 구현
- 로그인 폼 입력 상태 처리
- 로그인 요청 연결 지점 구성
```

## PR Template

현재 저장소의 PR 템플릿은 다음 형식을 사용합니다.

```markdown
## 📌 Summary

_작업 내용을 간단히 요약해주세요._

Jira: _관련 Jira 티켓 번호를 작성해주세요._

## 📚 Tasks

- _해당 PR에 수행한 작업을 설명해주세요._

<!--
## 👀 To Reviewer

_리뷰어에게 요청하고 싶은 내용을 작성해주세요._
-->

<!--
## 📸 Screenshot

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
