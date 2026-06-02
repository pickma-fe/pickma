import type { StoreResponse } from '@/contracts/store';
import type { Database } from '@/lib/supabase/database';

type StoresRow = Database['public']['Tables']['stores']['Row'];

export function mapStoreRow(row: StoresRow, canSell: boolean): StoreResponse {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    businessNumber: row.business_number,
    phone: row.phone,
    address: row.address,
    addressDetail: row.address_detail ?? undefined,
    region: row.region,
    image: row.image ?? undefined,
    openTime: row.open_time ?? undefined,
    closeTime: row.close_time ?? undefined,
    status: row.status,
    operationStatus: row.operation_status,
    canSell,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
