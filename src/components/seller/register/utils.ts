import type { AuthStepState } from './types';

export function getButtonColor(status: string): 'primary' | 'gray' {
  if (status === 'done') return 'gray';
  return 'primary';
}

export function getButtonVariant(status: string): 'filled' | 'outline' {
  if (status === 'done') return 'outline';
  return 'filled';
}

export function getStepCircleClass(status: string): string {
  if (status === 'done' || status === 'active') {
    return 'bg-primary-500 text-white';
  }
  return 'bg-gray-200 text-gray-400';
}

export function getStepLabel(status: string, id: number): string | number {
  if (status === 'done') return '✓';
  return id;
}

export function getStepStatus(
  stepId: number,
  state: AuthStepState
): 'done' | 'active' | 'pending' {
  switch (stepId) {
    case 1:
      return state.termsAgreed ? 'done' : 'active';
    case 2:
      if (!state.termsAgreed) return 'pending';
      return state.businessInfoSubmitted ? 'done' : 'active';
    case 3:
      if (!state.businessInfoSubmitted) return 'pending';
      return state.documentsSubmitted ? 'done' : 'active';
    case 4:
      if (!state.documentsSubmitted) return 'pending';
      return state.reviewStatus === 'completed' ? 'done' : 'active';
    case 5:
      if (state.reviewStatus !== 'completed') return 'pending';
      return state.certificationStatus === 'approved' ? 'done' : 'active';
    default:
      return 'pending';
  }
}
