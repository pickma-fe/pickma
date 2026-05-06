const TIME_ONLY_PATTERN = /^(\d{2}):(\d{2})(?::\d{2})?$/;

export function formatPickupTime(value: string) {
  const timeOnlyMatch = value.match(TIME_ONLY_PATTERN);

  if (timeOnlyMatch) {
    const [, hours, minutes] = timeOnlyMatch;

    return `${hours}:${minutes}`;
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
