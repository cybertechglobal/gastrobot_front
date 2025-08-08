import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get user initials for avatar
export const getUserInitials = (firstname?: string, lastname?: string) => {
  if (!firstname || !lastname) return 'NN';

  return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
};
