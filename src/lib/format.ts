/**
 * 날짜+시간 포맷 (년/월/일 시:분)
 * ex) 2024.01.01 14:30
 */
export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value);
}

/**
 * 날짜+시간 포맷 (undefined 허용)
 * ex) 2024.01.01 14:30 / '-'
 */
export function formatDateTimeOrEmpty(value: Date | undefined): string {
  if (!value) return '-';
  return formatDateTime(value);
}

/**
 * 날짜만 포맷 (년/월/일)
 * ex) 2024.01.01
 */
export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}

/**
 * 숫자 천단위 콤마 포맷
 * ex) 1,000,000
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
