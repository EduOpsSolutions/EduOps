// Utility functions for handling recurring schedule events

// Map day abbreviations to day indices (0 = Sunday, 6 = Saturday)
export const dayAbbreviationMap = {
  SU: 0,
  M: 1,
  T: 2,
  W: 3,
  TH: 4,
  F: 5,
  S: 6,
};

/**
 * Check if a date falls within the academic period range
 * @param {Date} date - The date to check
 * @param {Date|string} periodStart - Academic period start date
 * @param {Date|string} periodEnd - Academic period end date
 * @returns {boolean} - True if date is within period range
 */
export const isDateInPeriod = (date, periodStart, periodEnd) => {
  if (!periodStart || !periodEnd) return true; // No period restrictions

  const checkDate = new Date(date);
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);

  // Reset times to compare dates only
  checkDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return checkDate >= startDate && checkDate <= endDate;
};

/**
 * Check if an event occurs on a given day of the week
 * @param {Object} event - Event object with a 'days' property (e.g., "M,W,F" or "T,TH")
 * @param {number} dayOfWeek - Day of the week (0 = Sunday, 6 = Saturday)
 * @returns {boolean} - True if the event occurs on the given day
 */
export const eventOccursOnDay = (event, dayOfWeek) => {
  if (!event.days) return false;

  // Parse the days string (e.g., "M,W,F" or "T,TH")
  const eventDays = event.days.split(',').map((d) => d.trim().toUpperCase());

  // Check if any of the event's days match this date's day of week
  return eventDays.some((dayAbbr) => {
    const mappedDay = dayAbbreviationMap[dayAbbr];
    return mappedDay === dayOfWeek;
  });
};

/**
 * Filter events that occur on a specific date based on recurrence pattern and period range
 * @param {Array} events - Array of event objects
 * @param {Date} date - The date to filter events for
 * @returns {Array} - Filtered array of events that occur on the given date
 */
export const getEventsForDate = (events, date) => {
  const dayOfWeek = date.getDay();
  return events.filter((event) => {
    // Check if event occurs on this day of the week
    const occursOnDay = eventOccursOnDay(event, dayOfWeek);

    // Check if date is within academic period range
    const withinPeriod = isDateInPeriod(
      date,
      event.periodStart,
      event.periodEnd
    );

    return occursOnDay && withinPeriod;
  });
};

/**
 * Parse time string to hours and minutes
 * @param {string} timeString - Time string (e.g., "10:00 AM")
 * @returns {Object} - Object with hour and minute properties
 */
export const parseTime = (timeString) => {
  const normalized = timeString.trim();
  const isPM = normalized.toLowerCase().includes('pm');
  const timeMatch = normalized.match(/(\d+):(\d+)/);

  if (!timeMatch) return { hour: 0, minute: 0 };

  let hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  // Convert to 24-hour format
  if (isPM && hour !== 12) {
    hour += 12;
  } else if (!isPM && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
};

/**
 * Convert 24-hour time format to 12-hour format for comparison
 * @param {string} time24 - Time in 24-hour format (e.g., "14:00")
 * @returns {string} - Time in 12-hour format (e.g., "2:00 PM")
 */

/**
 * Get events for a specific time slot and date
 * @param {Array} events - Array of event objects
 * @param {string} timeSlot - Time slot string (e.g., "10:00 AM")
 * @param {Date} date - The date to get events for
 * @returns {Array} - Filtered array of events
 */
export const getEventsForTimeSlot = (events, timeSlot, date) => {
  return events.filter((event) => {
    // Check if the event occurs on this day of the week
    const dayOfWeek = date.getDay();
    const dayMatches = eventOccursOnDay(event, dayOfWeek);

    // Check if date is within academic period range
    const withinPeriod = isDateInPeriod(
      date,
      event.periodStart,
      event.periodEnd
    );

    if (!dayMatches || !withinPeriod) {
      return false;
    }

    // Compare by 30-minute slot window: event time in [slotStart, slotStart+30)
    const { hour, minute } = parseTime(timeSlot); // timeSlot is 12-hour string
    const slotStartMinutes = hour * 60 + minute;
    const slotEndMinutes = slotStartMinutes + 30;

    const [eh, em] = String(event.time_start).split(':').map(Number);
    const eventMinutes = eh * 60 + em;

    return eventMinutes >= slotStartMinutes && eventMinutes < slotEndMinutes;
  });
};
