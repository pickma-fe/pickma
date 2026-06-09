import { NextResponse } from 'next/server';

import type { ValidationIssue } from '@/contracts/common';
import { AppError } from '@/lib/errors/appError';
import type { ErrorCode } from '@/lib/errors/errorCodes';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { ERROR_MESSAGES } from '@/lib/errors/errorMessages';

export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ statusCode: status, data }, { status });
}

export function fail(
  code: ErrorCode,
  status?: number,
  details?: ValidationIssue[]
): NextResponse {
  const httpStatus = status ?? inferStatus(code);
  const body = {
    statusCode: httpStatus,
    error: {
      code,
      message: ERROR_MESSAGES[code],
      ...(details && { details }),
    },
  };
  return NextResponse.json(body, { status: httpStatus });
}

export function routeError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return fail(error.code, error.statusCode, error.details);
  }

  return fail(ERROR_CODE.INTERNAL_SERVER_ERROR);
}

function inferStatus(code: ErrorCode): number {
  const map: Partial<Record<ErrorCode, number>> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    PRODUCT_NOT_FOUND: 404,
    ORDER_NOT_FOUND: 404,
    STORE_NOT_FOUND: 404,
    STORE_INACTIVE: 403,
    CATEGORY_NOT_FOUND: 404,
    MENU_ITEM_NOT_FOUND: 404,
    MENU_ITEM_INACTIVE: 409,
    STORE_ALREADY_EXISTS: 409,
    SELLER_APPLICATION_NOT_FOUND: 404,
    APPLICATION_ALREADY_SUBMITTED: 409,
    SELLER_ALREADY_REGISTERED: 409,
    APPLICATION_DOCUMENT_NOT_FOUND: 404,
    AUTH_IDENTITY_CONFLICT: 409,
    RATE_LIMIT_EXCEEDED: 429,
    AUTH_EMAIL_ALREADY_EXISTS: 409,
    AUTH_EMAIL_SEND_FAILED: 502,
    AUTH_EMAIL_OTP_EXPIRED: 400,
    AUTH_EMAIL_OTP_INVALID: 400,
    AUTH_EMAIL_OTP_ATTEMPT_LIMIT_EXCEEDED: 429,
    AUTH_EMAIL_VERIFICATION_TOKEN_EXPIRED: 400,
    AUTH_EMAIL_VERIFICATION_TOKEN_INVALID: 400,
    AUTH_EMAIL_SIGNUP_IN_PROGRESS: 409,
    AUTH_EMAIL_STORE_UNAVAILABLE: 503,
    OUT_OF_STOCK: 409,
    PRODUCT_EXPIRED: 409,
    PRODUCT_NOT_AVAILABLE: 409,
    ORDER_EXPIRED: 409,
    PAYMENT_AMOUNT_MISMATCH: 400,
    PAYMENT_CONFIRM_FAILED: 502,
    PAYMENT_CANCEL_FAILED: 502,
    PAYMENT_ALREADY_CONFIRMED: 409,
    INVALID_WEBHOOK_PAYLOAD: 400,
    DUPLICATE_PRODUCT_IN_ORDER: 400,
    ORDER_NUMBER_EXHAUSTED: 503,
    PICKUP_NUMBER_EXHAUSTED: 409,
    NOT_IMPLEMENTED: 501,
    INTERNAL_SERVER_ERROR: 500,
  };
  return map[code] ?? 500;
}
