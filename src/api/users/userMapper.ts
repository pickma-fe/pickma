import type { User } from '@/types/user';
import type { UserResponse } from '@/contracts/user';

export function mapUser(dto: UserResponse): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    phone: dto.phone,
    authProvider: dto.authProvider,
    profileImage: dto.profileImage,
    locationLat: dto.locationLat,
    locationLng: dto.locationLng,
    locationAddress: dto.locationAddress,
    role: dto.role,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
