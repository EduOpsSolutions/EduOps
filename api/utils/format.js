/**
 * Convert 24-hour format to 12-hour format with locale
 * @param {string} time24hrString - Time in 24-hour format (e.g., "14:00")
 * @returns {string} - Time in 12-hour format (e.g., "2:00 PM")
 */
export const convert24To12HourFormatLocale = (time24hrString) => {
  // Create a Date object from a dummy date and the time string
  const [hours, minutes] = time24hrString.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes); // Use a fixed date for consistency

  // Use toLocaleTimeString with options for 12-hour format
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};
