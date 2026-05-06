export function formatPickupTime(value: string) {
  const timeMatch = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);

  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
