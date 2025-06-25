import { subDays, intervalToDuration, parseISO, isBefore } from 'date-fns';

/**
 * Calculates countdown time (months, days, hours, minutes) from now
 * until the start date which is (dueDate - estimatedDays).
 *
 * @param {string | Date} dueDate - The due date (ISO string or Date object)
 * @param {number} estimatedDays - Number of days before due date
 * @returns {Object} { months, days, hours, minutes }
 */
export function calculateCountdownDuration(dueDate, estimatedDays) {
  const parsedDueDate = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const startDate = subDays(parsedDueDate, estimatedDays);

  const now = new Date();
  const countdownFrom = isBefore(now, startDate) ? now : startDate;

  const duration = intervalToDuration({
    start: countdownFrom,
    end: startDate,
  });

  const { months, days, hours, minutes } = duration;
  return { months, days, hours, minutes };
}
