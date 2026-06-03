'use client';

import type { UseQueryResult } from '@tanstack/react-query';

import type { User, UserRole } from '@/types/user';
import { ApiError } from '@/api/apiClient';
import { useMe } from '@/hooks/users/useMe';

export type RoleGuardStatus =
  | 'loading'
  | 'ok'
  | 'unauthorized'
  | 'forbidden'
  | 'error';

export type RoleGuardResult = {
  status: RoleGuardStatus;
  user?: User;
  error?: unknown;
  refetch: UseQueryResult<User>['refetch'];
};

export function useRoleGuard(
  expectedRole: UserRole,
  enabled: boolean = true
): RoleGuardResult {
  const { data: user, isLoading, isError, error, refetch } = useMe();

  if (isLoading) {
    return { status: 'loading', refetch };
  }

  if (isError) {
    if (!enabled) {
      return { status: 'ok', user: undefined, refetch };
    }
    if (
      error instanceof ApiError &&
      (error.statusCode === 401 || error.code === 'UNAUTHORIZED')
    ) {
      return { status: 'unauthorized', error, refetch };
    }
    if (error instanceof ApiError && error.statusCode === 403) {
      return { status: 'forbidden', error, refetch };
    }
    return { status: 'error', error, refetch };
  }

  if (!enabled) {
    return { status: 'ok', user, refetch };
  }

  if (user?.role !== expectedRole) {
    return { status: 'forbidden', user, refetch };
  }

  return { status: 'ok', user, refetch };
}
