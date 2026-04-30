import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';

export async function validateBody<T>(
  schema: ZodType<T>,
  req: NextRequest
): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    throw new AppError(
      ERROR_CODE.VALIDATION_ERROR,
      400,
      undefined,
      result.error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }
  return result.data;
}

export function validateQuery<T>(
  schema: ZodType<T>,
  searchParams: URLSearchParams
): T {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(
      ERROR_CODE.VALIDATION_ERROR,
      400,
      undefined,
      result.error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }
  return result.data;
}
