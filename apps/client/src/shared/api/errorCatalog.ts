export type ErrorCatalogEntry = {
  status: number
  message: string
}

export const ERROR_CATALOG = {
  'COMMON-400': { status: 400, message: '잘못된 요청입니다' },
  'COMMON-401': { status: 401, message: '인증이 필요합니다' },
  'COMMON-403': { status: 403, message: '권한이 없습니다' },
  'COMMON-404': { status: 404, message: '리소스를 찾을 수 없습니다' },
  'COMMON-405': {
    status: 405,
    message: '허용되지 않은 요청 메서드입니다',
  },
  'COMMON-409': {
    status: 409,
    message: '요청이 겹쳤습니다. 잠시 후 다시 시도해주세요',
  },
  'COMMON-415': { status: 415, message: '지원하지 않는 요청 형식입니다' },
  'COMMON-500': { status: 500, message: '서버 오류입니다' },
  'AUTH-001': { status: 401, message: '유효하지 않은 토큰입니다' },
  'AUTH-002': { status: 401, message: '만료된 토큰입니다' },
  'AUTH-003': {
    status: 401,
    message: '리프레시 토큰이 존재하지 않습니다',
  },
  'AUTH-004': {
    status: 401,
    message: '이미 사용된 토큰입니다. 다시 로그인해주세요',
  },
  'AUTH-005': { status: 401, message: '카카오 인증에 실패했습니다' },
  'AUTH-006': {
    status: 401,
    message: '유효하지 않은 온보딩 토큰입니다',
  },
  'AUTH-007': {
    status: 502,
    message: '카카오 서버와 통신할 수 없습니다',
  },
  'AUTH-008': { status: 409, message: '이미 가입된 소셜 계정입니다' },
  'AUTH-009': {
    status: 401,
    message: '아이디 또는 비밀번호가 올바르지 않습니다',
  },
  'USER-001': { status: 409, message: '중복된 닉네임입니다' },
  'USER-002': { status: 409, message: '이미 사용 중인 이메일입니다' },
  'USER-003': { status: 409, message: '이미 사용 중인 연락처입니다' },
  'USER-004': { status: 409, message: '이미 사용 중인 가입 정보입니다' },
  'USER-005': { status: 404, message: '회원을 찾을 수 없습니다' },
  'RESTAURANT-001': {
    status: 400,
    message: '지원하지 않는 음식 장르입니다.',
  },
  'RESTAURANT-002': {
    status: 400,
    message: '지원하지 않는 정렬 기준입니다.',
  },
  'RESTAURANT-003': {
    status: 400,
    message: '지원하지 않는 식당 목록 유형입니다.',
  },
  'RESTAURANT-004': {
    status: 404,
    message: '식당을 찾을 수 없습니다.',
  },
  'RESTAURANT-005': {
    status: 400,
    message: '지원하지 않는 큐레이션 유형입니다.',
  },
  'RESTAURANT-006': {
    status: 400,
    message:
      '영업시간 정보가 올바르지 않습니다. 모든 요일을 중복 없이 포함하고 시간 규칙을 지켜야 합니다.',
  },
  'RESERVATION-001': { status: 404, message: '예약을 찾을 수 없습니다' },
  'RESERVATION-002': {
    status: 404,
    message: '예약하려는 식당을 찾을 수 없습니다',
  },
  'RESERVATION-003': {
    status: 400,
    message: '사용 포인트가 결제 수수료를 초과했습니다',
  },
  'RESERVATION-004': { status: 409, message: '이미 취소된 예약입니다' },
  'RESERVATION-005': {
    status: 409,
    message: '취소할 수 없는 상태의 예약입니다',
  },
  'RESERVATION-006': {
    status: 400,
    message: '결제 금액이 수수료 계산과 일치하지 않습니다',
  },
  'RESERVATION-007': {
    status: 404,
    message: '예약자를 찾을 수 없습니다',
  },
  'REVIEW-001': {
    status: 409,
    message: '이미 리뷰를 작성한 예약입니다.',
  },
  'REVIEW-002': {
    status: 409,
    message: '방문 완료된 예약만 리뷰를 작성할 수 있습니다.',
  },
  'REVIEW-003': {
    status: 400,
    message: '지원하지 않는 리뷰 상태입니다.',
  },
  'REVIEW-004': {
    status: 400,
    message: '지원하지 않는 리뷰 정렬 기준입니다.',
  },
  'REVIEW-005': {
    status: 400,
    message: '지원하지 않는 리뷰 키워드입니다.',
  },
  'REVIEW-006': { status: 404, message: '리뷰를 찾을 수 없습니다.' },
  'REVIEW-007': {
    status: 409,
    message: '등록 식당 예약만 리뷰를 작성할 수 있습니다.',
  },
  'POINT-001': { status: 400, message: '보유 포인트가 부족합니다' },
  'POINT-002': {
    status: 400,
    message: '포인트 금액은 1 이상이어야 합니다',
  },
  'POINT-003': {
    status: 404,
    message: '복원할 포인트 사용 내역을 찾을 수 없습니다',
  },
  'POINT-004': {
    status: 409,
    message: '이미 복원된 포인트 사용 내역입니다',
  },
  'UPLOAD-001': {
    status: 400,
    message: '지원하지 않는 파일 사용 목적입니다.',
  },
  'UPLOAD-002': {
    status: 400,
    message: '지원하지 않는 파일 형식입니다.',
  },
  'UPLOAD-003': {
    status: 400,
    message: '업로드 가능한 파일 크기를 초과했습니다.',
  },
  'MAGAZINE-001': { status: 404, message: '매거진을 찾을 수 없습니다.' },
} as const satisfies Record<string, ErrorCatalogEntry>

export type KnownApiErrorCode = keyof typeof ERROR_CATALOG

const COMMON_ERROR_CODE_BY_STATUS = {
  400: 'COMMON-400',
  401: 'COMMON-401',
  403: 'COMMON-403',
  404: 'COMMON-404',
  405: 'COMMON-405',
  409: 'COMMON-409',
  415: 'COMMON-415',
  500: 'COMMON-500',
} as const satisfies Partial<Record<number, KnownApiErrorCode>>

export const checkIsKnownApiErrorCode = (
  code: string,
): code is KnownApiErrorCode => Object.hasOwn(ERROR_CATALOG, code)

export const getErrorCatalogEntry = (code: string) => {
  if (!checkIsKnownApiErrorCode(code)) {
    return undefined
  }

  return { code, ...ERROR_CATALOG[code] }
}

export const getCommonErrorCatalogEntryByStatus = (status: number) => {
  const code =
    COMMON_ERROR_CODE_BY_STATUS[
      status as keyof typeof COMMON_ERROR_CODE_BY_STATUS
    ]

  return code ? { code, ...ERROR_CATALOG[code] } : undefined
}
