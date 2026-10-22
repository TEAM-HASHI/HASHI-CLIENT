# Restaurant Location Review

- 기획 SPRINT-001 §6.9와 서버 `docs/map/location-jobs.md`, `place-selection.md`를 따른다. HASHI-235는 기존 식당의 위치 검토·보정이며 등록 전 미리보기(HASHI-236)와 관광 지역(HASHI-237)은 제외한다.
- ADMIN만 `/admin/restaurants/locations`에 접근한다. 기본 REVIEW_REQUIRED, 선택 출처 필터와 0-based page/size=20을 모든 query key에 포함한다. 처리 후 목록을 무효화하고 비어진 마지막 페이지는 유효 페이지로 돌아간다.
- 식당 관리의 위치 검토 링크와 기존 수정 화면에서 같은 위치 확인 UI를 사용한다. 단건 상태와 확인 관리자 로그인 ID·내부 ID, 확인 방식·접수 시각·revision·유효 기한을 표시한다. 상태 응답에 현재 승인 좌표는 없으므로 임의 핀을 만들지 않는다.
- 상태 재조회는 GET만 사용한다. PENDING은 최대 1분간 3초 간격으로 확인하고 이후 수동 새로고침한다. 비활성 창에서는 자동 확인하지 않는다.
- 재요청·후보 검색 전에 최신 상태를 조회한다. 재요청은 canRetry, 후보 검색은 READY/REVIEW_REQUIRED/FAILED/RETRY_WAIT와 양수 revision을 따른다. 후보 검색은 유료이므로 진입·polling·retry 옵션으로 자동 실행하지 않는다.
- 검색 응답의 식당 ID·revision·좌표·토큰·만료 정보를 확인한다. 후보는 자동 선택하지 않고 Google 지도·외부 지도 링크·제3자 attribution을 표시한다. 확인 모달 후 검색 응답의 revision과 selectionToken만 선택 요청에 보낸다.
- 토큰은 로컬 component 메모리에서만 사용하고 URL·영구 저장소·로그에 기록하지 않는다. 만료 시 또는 400/409 후 폐기하고 다시 검색한다. 409는 상태를 재조회하되 유료 검색·선택은 자동 재시도하지 않는다. 닫기·식당 변경 시 진행 중 요청을 중단하고 늦은 결과를 무시한다.
- 선택 성공은 PENDING 접수이며 READY 완료와 다르다. 기존 승인 좌표가 즉시 제거됨을 사전에 안내한다. 기존 수정 화면에서 이름·주소 미저장 변경이 있으면 위치 action을 막는다.
- 검토 목록의 주소 보정은 변경 필드만 PATCH한다. 표시 주소 변경 시 기존 별도 지정 주소를 함께 보내 보존하고, 위치 확인용 주소를 비우면 빈 문자열로 명시 삭제한다. 실패 시 입력을 보존하고 중복 저장을 막는다. 주소에 실제 미저장 변경이 있는 동안 후보 검색·선택을 막고, 두 주소를 원래 값으로 복원하면 잠금을 해제한다.
- 수정·비공개 처리 후 위치 목록과 대상 상태를 갱신한다. 수정 성공 시 해당 식당의 진행 중 prefill 조회를 취소하고 모든 prefill 변형을 stale 처리한다. 열린 폼은 즉시 재조회하지 않아 미저장 입력을 유지하며, 다시 열 때 최신 데이터를 조회한다. 다른 식당의 prefill은 유지한다.
- 서버 후속: OpenAPI `Candidate`가 이미지 DTO와 충돌해 Places 후보 필드가 누락된다. 후보 타입만 `RestaurantPlacesSearchResponse.Candidate` 서버 DTO 기준으로 보완했으며 스키마 수정 후 generated 타입으로 교체한다.
- 중요한 예외만 자동 검증한다: 유료 중복 요청 방지, revision 충돌·만료 토큰 차단, 화면 이탈 요청 중단, PENDING 의미, 주소 override 보존·명시 삭제·실패 입력 유지, 잘못된 후보 응답 차단. 단순 UI·스타일 테스트는 추가하지 않는다.
