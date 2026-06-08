import { requireActiveUser } from '@/app/api/_lib/auth';
import { isApiMockEnabled } from '@/app/api/_lib/mock';
import { routeError, success } from '@/app/api/_lib/response';

import { getDocumentSignedUrl } from '../../../me/_lib/service';

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

const MOCK_SIGNED_URLS: Record<string, string> = {
  doc_mock_1: '/images/mock/documents/business-license.jpeg',
  doc_mock_2: '/images/mock/documents/food-service-permit.jpeg',
  doc_mock_3: '/images/mock/documents/bank-account.jpeg',
};

const MOCK_SIGNED_URL_FALLBACK = '/images/mock/documents/business-license.jpeg';

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { documentId } = await context.params;

    if (isApiMockEnabled()) {
      const signedUrl =
        MOCK_SIGNED_URLS[documentId] ?? MOCK_SIGNED_URL_FALLBACK;
      return success({ signedUrl });
    }

    const { authUser } = await requireActiveUser();
    const signedUrl = await getDocumentSignedUrl(authUser.id, documentId);
    return success({ signedUrl });
  } catch (error) {
    return routeError(error);
  }
}
