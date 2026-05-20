import type { Store } from '@/types/store';
import type { AdminStoreResponse } from '@/contracts/admin';

export function mapAdminStore(dto: AdminStoreResponse): Store {
  return {
    id: dto.id,
    userId: dto.userId,
    name: dto.name,
    description: dto.description,
    businessNumber: dto.businessNumber,
    phone: dto.phone,
    address: dto.address,
    addressDetail: dto.addressDetail,
    region: dto.region,
    image: dto.image,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
