import type {
  AdminStoreListResponse,
  AdminStoreResponse,
} from '@/contracts/admin';
import type { Database } from '@/lib/supabase/database';

type StoreRow = Database['public']['Tables']['stores']['Row'];
type AdminStoreRow = Pick<
  StoreRow,
  | 'id'
  | 'user_id'
  | 'name'
  | 'description'
  | 'business_number'
  | 'phone'
  | 'address'
  | 'address_detail'
  | 'region'
  | 'image'
  | 'status'
  | 'operation_status'
  | 'created_at'
  | 'updated_at'
>;

export function toAdminStoreResponse(row: AdminStoreRow): AdminStoreResponse {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    ...(row.description && { description: row.description }),
    businessNumber: row.business_number,
    phone: row.phone,
    address: row.address,
    ...(row.address_detail && { addressDetail: row.address_detail }),
    region: row.region,
    ...(row.image && { image: row.image }),
    status: row.status,
    operationStatus: row.operation_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toAdminStoreListResponse(
  items: AdminStoreResponse[],
  total: number,
  page: number,
  pageSize: number
): AdminStoreListResponse {
  return {
    items,
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
