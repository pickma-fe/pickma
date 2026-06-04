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

type RefetchFn = UseQueryResult<User>['refetch'];

type RoleGuardResultLoading = { status: 'loading'; refetch: RefetchFn };
type RoleGuardResultOk = {
  status: 'ok';
  user: User | undefined;
  refetch: RefetchFn;
};
type RoleGuardResultFailed = {
  status: 'unauthorized' | 'forbidden' | 'error';
  user?: User;
  error?: unknown;
  refetch: RefetchFn;
};

export type RoleGuardResult =
  | RoleGuardResultLoading
  | RoleGuardResultOk
  | RoleGuardResultFailed;

export function useRoleGuard(
  expectedRole: UserRole,
  enabled: boolean = true
): RoleGuardResult {
  const { data: user, isLoading, isError, error, refetch } = useMe();

  if (isLoading) {
    return { status: 'loading', refetch };
  }

  if (isError) {
    if (
      error instanceof ApiError &&
      (error.statusCode === 401 || error.code === 'UNAUTHORIZED')
    ) {
      if (!enabled) return { status: 'ok', user: undefined, refetch };
      return { status: 'unauthorized', error, refetch };
    }
    if (error instanceof ApiError && error.statusCode === 403) {
      if (!enabled) return { status: 'ok', user: undefined, refetch };
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
