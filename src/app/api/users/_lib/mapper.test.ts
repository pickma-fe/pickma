import { describe, expect, it } from 'vitest';

import type { Database } from '@/lib/supabase/database';

import { mapUserRow } from './mapper';

type UsersRow = Database['public']['Tables']['users']['Row'];

const baseRow: UsersRow = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  phone: null,
  profile_image: null,
  role: 'customer',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('mapUserRow', () => {
  it('DB row를 UserResponse DTO로 변환한다', () => {
    expect(mapUserRow(baseRow)).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      name: '홍길동',
      phone: undefined,
      profileImage: undefined,
      role: 'customer',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  it('phone null을 undefined로 변환한다', () => {
    expect(mapUserRow({ ...baseRow, phone: null }).phone).toBeUndefined();
  });

  it('profile_image null을 undefined로 변환한다', () => {
    expect(
      mapUserRow({ ...baseRow, profile_image: null }).profileImage
    ).toBeUndefined();
  });

  it('phone과 profile_image 값이 있으면 그대로 반환한다', () => {
    const result = mapUserRow({
      ...baseRow,
      phone: '010-1234-5678',
      profile_image: 'https://example.com/img.png',
    });
    expect(result.phone).toBe('010-1234-5678');
    expect(result.profileImage).toBe('https://example.com/img.png');
  });
});
