import type { ValidationIssue } from '@/contracts/common';

import type { ErrorCode } from './errorCodes';
import { ERROR_MESSAGES } from './errorMessages';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: ValidationIssue[];

  constructor(
    code: ErrorCode,
    statusCode: number,
    message?: string,
    details?: ValidationIssue[]
  ) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
