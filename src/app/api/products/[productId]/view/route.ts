import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServerClient } from '@/lib/supabase/server';
import { getOrCreateUserByAuthUser } from '@/app/api/_lib/current-user';
import { fail, routeError, success } from '@/app/api/_lib/response';

import { productIdSchema } from '../../_lib/schemas';
import { recordProductView } from '../../_lib/view-service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
): Promise<Response> {
  const { productId } = await params;
  const parsed = productIdSchema.safeParse(productId);

  if (!parsed.success) {
    return fail(
      ERROR_CODE.VALIDATION_ERROR,
      400,
      parsed.error.issues.map((issue) => ({
        path: issue.path.length ? issue.path.join('.') : 'productId',
        message: issue.message,
      }))
    );
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return success({ recorded: false });
    }

    const serviceUser = await getOrCreateUserByAuthUser(supabase, user);

    if (serviceUser.status !== 'active') {
      return success({ recorded: false });
    }

    const recorded = await recordProductView(serviceUser.id, parsed.data);
    return success({ recorded });
  } catch (error) {
    return routeError(error);
  }
}
