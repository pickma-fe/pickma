import type { UserResponse } from '@/contracts/user';
import type { Database } from '@/lib/supabase/database';

type UsersRow = Database['public']['Tables']['users']['Row'];

export function mapUserRow(row: UsersRow): UserResponse {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone ?? undefined,
    profileImage: row.profile_image ?? undefined,
    locationLat: row.location_lat ?? undefined,
    locationLng: row.location_lng ?? undefined,
    locationAddress: row.location_address ?? undefined,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
