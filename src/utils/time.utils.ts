/**
 * Utility functions for time conversion
 * Handles conversion between time strings (HH:MM) and DateTime objects for PostgreSQL TIME columns
 */

/**
 * Converts a time string (HH:MM or HH:MM:SS) to a DateTime object
 * PostgreSQL TIME columns only store the time portion, but Prisma requires DateTime
 * We use a dummy date (1970-01-01) as the date portion is ignored by the DB
 *
 * @param timeString - Time in format "HH:MM" or "HH:MM:SS"
 * @returns DateTime object with dummy date and specified time
 * @throws Error if timeString format is invalid
 *
 * @example
 * timeStringToDateTime("09:30") // Returns DateTime: 1970-01-01T09:30:00.000Z
 * timeStringToDateTime("14:45:30") // Returns DateTime: 1970-01-01T14:45:30.000Z
 */
export function timeStringToDateTime(timeString: string): Date {
  // Validate format: HH:MM or HH:MM:SS
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  const match = timeString.match(timeRegex);

  if (!match) {
    throw new Error(`Invalid time format: "${timeString}". Expected HH:MM or HH:MM:SS`);
  }

  const [, hours, minutes, seconds = '00'] = match;

  // Use dummy date (1970-01-01) - PostgreSQL TIME column only stores time portion
  const date = new Date(Date.UTC(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10)));

  return date;
}

/**
 * Converts a DateTime object to a time string (HH:MM)
 * Extracts only the time portion from a DateTime
 *
 * @param dateTime - DateTime object
 * @returns Time string in format "HH:MM"
 *
 * @example
 * dateTimeToTimeString(new Date("1970-01-01T09:30:00.000Z")) // Returns "09:30"
 */
export function dateTimeToTimeString(dateTime: Date): string {
  const hours = dateTime.getUTCHours().toString().padStart(2, '0');
  const minutes = dateTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Validates if a time string is in correct format
 *
 * @param timeString - Time string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimeString(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
  return timeRegex.test(timeString);
}

/**
 * Normalizes time input to string format (HH:MM)
 * Handles both DateTime objects and time strings
 *
 * @param time - DateTime object or time string
 * @returns Time string in format "HH:MM"
 *
 * @example
 * normalizeTimeToString(new Date("1970-01-01T09:30:00.000Z")) // Returns "09:30"
 * normalizeTimeToString("09:30") // Returns "09:30"
 */
export function normalizeTimeToString(time: Date | string): string {
  if (typeof time === 'string') {
    return time;
  }
  return dateTimeToTimeString(time);
}
