import { clsx, type ClassValue } from 'clsx';
import { isToday, isTomorrow, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { srLatn } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get user initials for avatar
export const getUserInitials = (firstname?: string, lastname?: string) => {
  if (!firstname || !lastname) return 'NN';

  return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
};

export const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return 'Upravo sada';
  if (diffInMinutes === 1) return 'Pre 1 minut';
  if (diffInMinutes < 60) return `Pre ${diffInMinutes} minuta`;
  return date.toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeInParts = (
  utcDateString: string
): {
  dayPart: string;
  timePart: string;
  full: string;
} => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const localDate = toZonedTime(utcDateString, timeZone);

  let dayPart = format(localDate, 'd. MMMM', { locale: srLatn });

  if (isToday(localDate)) {
    dayPart = 'Danas';
  } else if (isTomorrow(localDate)) {
    dayPart = 'Sutra';
  }

  const timePart = format(localDate, 'HH:mm');

  return { dayPart, timePart, full: `${dayPart} u ${timePart}` };
};
