import { format, isValid, isSameDay } from 'date-fns';

export function formatEventDateTime(
  startDatetime: string | null,
  endDatetime: string | null
): { dateRange: string | null; timeRange: string | null } {
  if (!startDatetime) return { dateRange: null, timeRange: null };

  const start = new Date(startDatetime);
  const end = endDatetime ? new Date(endDatetime) : null;

  if (!isValid(start)) return { dateRange: null, timeRange: null };

  const formatDate = (date: Date) => format(date, 'MMM d, yyyy');
  const formatTime = (date: Date) => format(date, 'h:mm a');

  let dateRange: string;
  let timeRange: string;

  if (end && isValid(end)) {
    if (isSameDay(start, end)) {
      dateRange = formatDate(start);
      timeRange = `${formatTime(start)} - ${formatTime(end)}`;
    } else {
      dateRange = `${formatDate(start)} - ${formatDate(end)}`;
      timeRange = `${formatTime(start)} - ${formatTime(end)}`;
    }
  } else {
    dateRange = formatDate(start);
    timeRange = formatTime(start);
  }

  return { dateRange, timeRange };
}

/** Returns a YYYY-MM-DD key using UTC date components — matches how events are grouped in the calendar. */
export function formatDateUTCKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns a YYYY-MM-DD key using local date components. */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
