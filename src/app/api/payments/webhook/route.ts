import type { NextRequest } from 'next/server';

import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { routeError, success } from '@/app/api/_lib/response';

import { parseWebhookBody } from './_lib/schemas';
import { processWebhook } from './_lib/service';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const rawBody = await request.json().catch(() => {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR, 400);
    });
    const transmissionId = request.headers.get(
      'tosspayments-webhook-transmission-id'
    );
    const body = parseWebhookBody(rawBody);
    await processWebhook(transmissionId, body);
    return success(null);
  } catch (error) {
    return routeError(error);
  }
}
