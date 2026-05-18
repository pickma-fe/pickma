import { isApiMockEnabled } from '@/app/api/_lib/mock';

export async function PUT(): Promise<Response> {
  if (!isApiMockEnabled()) {
    return new Response(null, { status: 404 });
  }
  return new Response(null, { status: 200 });
}
