import type {
  AdminUserListQuery,
  AdminUserListResponse,
} from '@/contracts/admin';
import { AppError } from '@/lib/errors/appError';
import { ERROR_CODE } from '@/lib/errors/errorCodes';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { mapUserRow } from '@/app/api/_lib/user-mapper';

const ADMIN_USER_SELECT_COLUMNS =
  'id,email,name,phone,profile_image,role,status,marketing_agreed,marketing_agreed_at,created_at,updated_at';

function escapePostgrestLikeValue(value: string): string {
  return value
    .replace(/[,*()]/g, ' ')
    .replace(/[%_]/g, '\\$&')
    .trim();
}

export async function getAdminUsers(
  query: AdminUserListQuery
): Promise<AdminUserListResponse> {
  const supabase = createServiceRoleClient();
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const offset = (page - 1) * pageSize;
  const searchValue = query.keyword
    ? escapePostgrestLikeValue(query.keyword)
    : '';

  let usersQuery = supabase
    .from('users')
    .select(ADMIN_USER_SELECT_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (query.role) {
    usersQuery = usersQuery.eq('role', query.role);
  }

  if (query.status) {
    usersQuery = usersQuery.eq('status', query.status);
  }

  if (searchValue.length > 0) {
    usersQuery = usersQuery.or(
      [
        `email.ilike.%${searchValue}%`,
        `name.ilike.%${searchValue}%`,
        `phone.ilike.%${searchValue}%`,
      ].join(',')
    );
  }

  const { data, error, count } = await usersQuery.range(
    offset,
    offset + pageSize - 1
  );

  if (error) {
    throw new AppError(ERROR_CODE.INTERNAL_SERVER_ERROR, 500);
  }

  const totalCount = count ?? 0;

  return {
    items: (data ?? []).map(mapUserRow),
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
