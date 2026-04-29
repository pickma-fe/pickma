import type { User } from '@/types/user';
import type { UserResponse } from '@/contracts/user';

export function mapUser(dto: UserResponse): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    phone: dto.phone,
    profileImage: dto.profileImage,
    role: dto.role,
    status: dto.status as User['status'],
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}
