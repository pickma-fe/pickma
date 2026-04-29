import type { MyStore } from '@/types/store';
import type { StoreResponse } from '@/contracts/store';

export function mapMyStore(dto: StoreResponse): MyStore {
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
    openTime: dto.openTime ? new Date(dto.openTime) : undefined,
    closeTime: dto.closeTime ? new Date(dto.closeTime) : undefined,
    status: dto.status,
    rejectReason: dto.rejectReason,
    canSell: dto.canSell,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
