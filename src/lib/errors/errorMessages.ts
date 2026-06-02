import type { ErrorCode } from './errorCodes';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  VALIDATION_ERROR: '요청 값이 올바르지 않습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  PRODUCT_NOT_FOUND: '상품을 찾을 수 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  STORE_NOT_FOUND: '가게를 찾을 수 없습니다.',
  STORE_INACTIVE: '비활성화된 가게입니다.',
  CATEGORY_NOT_FOUND: '카테고리를 찾을 수 없습니다.',
  MENU_ITEM_NOT_FOUND: '메뉴를 찾을 수 없습니다.',
  MENU_ITEM_INACTIVE: '판매 중지된 메뉴는 사용할 수 없습니다.',
  STORE_ALREADY_EXISTS: '이미 등록된 가게가 있습니다.',
  OUT_OF_STOCK: '재고가 부족합니다.',
  PRODUCT_EXPIRED: '판매가 마감된 상품입니다.',
  PRODUCT_NOT_AVAILABLE: '구매할 수 없는 상품입니다.',
  INVALID_ORDER_STATUS: '현재 주문 상태에서는 진행할 수 없습니다.',
  ORDER_EXPIRED: '결제 가능 시간이 만료되었습니다.',
  PAYMENT_AMOUNT_MISMATCH: '결제 금액이 일치하지 않습니다.',
  PAYMENT_CONFIRM_FAILED: '결제 승인에 실패했습니다.',
  DUPLICATE_PRODUCT_IN_ORDER: '주문 항목에 중복된 상품이 있습니다.',
  ORDER_NUMBER_EXHAUSTED: '주문번호가 모두 소진되었습니다.',
  PICKUP_NUMBER_EXHAUSTED: '픽업 번호가 모두 소진되었습니다.',
  AUTH_IDENTITY_CONFLICT: '이미 다른 로그인 방식으로 가입된 이메일입니다.',
  SELLER_APPLICATION_NOT_FOUND: '판매자 신청을 찾을 수 없습니다.',
  APPLICATION_ALREADY_SUBMITTED: '진행 중이거나 승인된 판매자 신청이 있습니다.',
  SELLER_ALREADY_REGISTERED: '이미 판매자로 등록되어 있습니다.',
  APPLICATION_DOCUMENT_NOT_FOUND: '신청 서류를 찾을 수 없습니다.',
  FILE_UPLOAD_NOT_ALLOWED: '파일 업로드 권한이 없습니다.',
  FILE_TYPE_NOT_ALLOWED: '허용되지 않는 파일 형식입니다.',
  FILE_TOO_LARGE: '파일 크기가 허용 한도를 초과했습니다.',
  RATE_LIMIT_EXCEEDED: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  AUTH_EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다. 로그인해 주세요.',
  AUTH_EMAIL_SEND_FAILED:
    '인증 메일을 발송하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  AUTH_EMAIL_OTP_EXPIRED: '인증 코드가 만료되었습니다. 다시 요청해 주세요.',
  AUTH_EMAIL_OTP_INVALID: '인증 코드가 올바르지 않습니다.',
  AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED:
    '인증 시도 횟수를 초과했습니다. 다시 요청해 주세요.',
  AUTH_EMAIL_VERIFICATION_TOKEN_EXPIRED:
    '이메일 인증이 만료되었습니다. 다시 인증해 주세요.',
  AUTH_EMAIL_VERIFICATION_TOKEN_INVALID:
    '이메일 인증이 유효하지 않습니다. 다시 인증해 주세요.',
  AUTH_EMAIL_SIGNUP_IN_PROGRESS:
    '회원가입 요청을 처리 중입니다. 잠시 후 다시 시도해 주세요.',
  AUTH_EMAIL_STORE_UNAVAILABLE:
    '이메일 인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  NOT_IMPLEMENTED: '아직 구현되지 않은 API입니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
};
