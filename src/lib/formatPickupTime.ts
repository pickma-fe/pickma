const TIME_ONLY_PATTERN = /^(\d{2}):(\d{2})(?::\d{2})?$/;

export interface PickupTimeOption {
  label: string;
  startAt: string;
  endAt: string;
}

function getPickupDate(value: string, now: Date) {
  if (!value.includes('T')) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return date;
}

function formatPickupDate(value: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(value);
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(value: Date, days: number) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate() + days
  );
}

export function formatPickupDateLabel(value: string, now = new Date()) {
  const pickupDate = getPickupDate(value, now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(today, 1);
  const formattedDate = formatPickupDate(pickupDate);

  if (isSameDate(pickupDate, today)) {
    return `오늘 ${formattedDate}`;
  }

  if (isSameDate(pickupDate, tomorrow)) {
    return `내일 ${formattedDate}`;
  }

  return formattedDate;
}

export function parsePickupTimeToMinutes(value: string) {
  if (value.includes('T')) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.getHours() * 60 + date.getMinutes();
  }

  const timeOnlyMatch = value.match(TIME_ONLY_PATTERN);

  if (!timeOnlyMatch) {
    return null;
  }

  const [, hours, minutes] = timeOnlyMatch;
  const hour = Number(hours);
  const minute = Number(minutes);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function formatMinutesToTime(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatPickupTime(value: string) {
  const minutes = parsePickupTimeToMinutes(value);

  if (minutes === null) {
    return value;
  }

  return formatMinutesToTime(minutes);
}

export function createPickupTimeOptions(startTime: string, endTime: string) {
  const start = parsePickupTimeToMinutes(startTime);
  const end = parsePickupTimeToMinutes(endTime);
  const options: PickupTimeOption[] = [];

  if (start === null || end === null || start >= end) {
    return options;
  }

  for (let current = start; current + 30 <= end; current += 30) {
    const next = current + 30;
    const optionStartTime = formatMinutesToTime(current);
    const optionEndTime = formatMinutesToTime(next);

    options.push({
      label: `${optionStartTime}~${optionEndTime}`,
      startAt: optionStartTime,
      endAt: optionEndTime,
    });
  }

  return options;
}

export function isPastPickupTimeSlot(
  pickupStartTime: string,
  pickupDateTime: string,
  now: Date
) {
  const slotStartMinutes = parsePickupTimeToMinutes(pickupStartTime);

  if (slotStartMinutes === null) {
    return true;
  }

  const pickupDate = getPickupDate(pickupDateTime, now);
  const pickupDateOnly = new Date(
    pickupDate.getFullYear(),
    pickupDate.getMonth(),
    pickupDate.getDate()
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (pickupDateOnly.getTime() > today.getTime()) {
    return false;
  }

  if (pickupDateOnly.getTime() < today.getTime()) {
    return true;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return slotStartMinutes <= nowMinutes;
}
