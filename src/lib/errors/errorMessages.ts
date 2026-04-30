import type { ErrorCode } from './errorCodes';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  VALIDATION_ERROR: '요청 값이 올바르지 않습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  PRODUCT_NOT_FOUND: '상품을 찾을 수 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  STORE_NOT_FOUND: '가게를 찾을 수 없습니다.',
  STORE_NOT_APPROVED: '승인된 가게만 사용할 수 있습니다.',
  STORE_ALREADY_EXISTS: '이미 등록된 가게가 있습니다.',
  OUT_OF_STOCK: '재고가 부족합니다.',
  PRODUCT_EXPIRED: '판매가 마감된 상품입니다.',
  ORDER_EXPIRED: '결제 가능 시간이 만료되었습니다.',
  PAYMENT_AMOUNT_MISMATCH: '결제 금액이 일치하지 않습니다.',
  PAYMENT_CONFIRM_FAILED: '결제 승인에 실패했습니다.',
  PICKUP_NUMBER_EXHAUSTED: '픽업 번호가 모두 소진되었습니다.',
  NOT_IMPLEMENTED: '아직 구현되지 않은 API입니다.',
  INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
};
