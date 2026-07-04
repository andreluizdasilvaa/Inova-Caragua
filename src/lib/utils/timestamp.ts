/**
 * Utility functions for consistent timestamp handling across the application.
 * All timestamps should use this utility to ensure uniformity.
 */

/**
 * Returns the current timestamp formatted as "DD/MM/YYYY às HH:MM"
 * This is the standard format used throughout the application.
 */
export function getCurrentTimestamp(): string {
  const now = new Date();
  return formatTimestamp(now);
}

/**
 * Formats a Date object to "DD/MM/YYYY às HH:MM"
 */
export function formatTimestamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

/**
 * Formats a Date object to "DD/MM/YYYY" (date only)
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formats a Date object to "HH:MM" (time only)
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Parses a date string in "DD/MM/YYYY" format to a Date object
 */
export function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
}

/**
 * Generates a new occurrence ID in the format "#REQ-XXXX"
 * where XXXX is a sequential number based on existing occurrences count
 */
export function generateOccurrenceId(existingIds: string[]): string {
  const maxNum = existingIds.reduce((max, id) => {
    const match = id.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 2049);
  
  return `#REQ-${maxNum + 1}`;
}