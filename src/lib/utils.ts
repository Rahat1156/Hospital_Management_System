import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate an MRN in HAX-XXXXX format per SRS FR-PAT-01.
 * In production this comes from backend. Used here for mock data.
 */
export function generateMRN(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `HAX-${digits}`;
}

/**
 * Format BDT currency with Bangla locale.
 * 1500 → "৳1,500"
 */
export function formatBDT(amount: number, showDecimals = false): string {
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
  return `৳${formatted}`;
}

/**
 * Format date as DD/MM/YYYY (Bangladesh convention per SRS 4.3).
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format datetime as DD/MM/YYYY hh:mm AM/PM (Asia/Dhaka).
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const datePart = formatDate(d);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${datePart} ${h12}:${minutes} ${period}`;
}

/**
 * Format time as hh:mm AM/PM.
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}

/**
 * Relative time: "2 hours ago", "in 3 days".
 */
export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  const isPast = diff < 0;
  const suffix = isPast ? 'ago' : 'from now';

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ${suffix}`;
  if (hours < 24) return `${hours}h ${suffix}`;
  if (days < 30) return `${days}d ${suffix}`;
  return formatDate(d);
}

/**
 * Calculate age in years from date of birth.
 */
export function calculateAge(dob: string | Date): number {
  const birth = typeof dob === 'string' ? new Date(dob) : dob;
  const ageMs = Date.now() - birth.getTime();
  return Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
}

/**
 * Format a Bangladesh phone as "+880 1712-345678".
 */
export function formatPhone(phone: { country_code: string; number: string }): string {
  if (!phone?.number) return '';
  const n = phone.number;
  if (n.length === 10) {
    return `${phone.country_code} ${n.slice(0, 4)}-${n.slice(4)}`;
  }
  return `${phone.country_code} ${n}`;
}

/**
 * Get initials from a full name. "Md. Rahim Uddin" → "MR".
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().replace(/\./g, '').split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Simulated network delay for mock API.
 */
export function delay(ms: number = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deterministic pick from an array based on index.
 */
export function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

/**
 * Random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a UUID v4.
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
