import PropTypes from 'prop-types';
import React from 'react';
import TileEvent from './TileEvent';
import { getEventsForDate } from '../../utils/scheduleUtils';

// Replace with logic of getting the events of that day
const defaultEvents = [
  {
    title: 'A1: Basic German Course',
    days: 'M,W,F',
    time_start: '10:00 AM',
    time_end: '11:00 AM',
    color: '#FFCF00',
    periodStart: '2025-09-01',
    periodEnd: '2025-12-15',
    periodName: 'Fall 2025',
  },
  {
    title: 'A1: Basic German Course',
    days: 'T,TH',
    time_start: '1:30 PM',
    time_end: '2:30 PM',
    color: '#0099FF',
    periodStart: '2025-09-01',
    periodEnd: '2025-12-15',
    periodName: 'Fall 2025',
  },
  {
    title: 'A2: Basic German Course',
    days: 'T,TH',
    time_start: '1:30 PM',
    time_end: '2:30 PM',
    color: '#29CC6A',
    periodStart: '2025-09-01',
    periodEnd: '2025-12-15',
    periodName: 'Fall 2025',
  },
];

function DateTile({
  day = null,
  month,
  year,
  events = defaultEvents,
  onDateClick,
  timeFormat = '12h',
  viewDensity = 'default',
}) {
  // Handle blank tiles (day === null)
  if (day === null) {
    return (
      <div className="hover:cursor-pointer flex flex-col m-0.5 md:m-2 rounded-md p-1 md:p-2 border-solid border-2 border-neutral-400 hover:border-red-700 duration-100">
        {/* Blank tile */}
      </div>
    );
  }

  // Filter events that occur on this day of the week
  const currentDate = new Date(year, month, day);
  const today = new Date();
  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate();
  const filteredEvents = getEventsForDate(events, currentDate);

  const handleClick = () => {
    if (onDateClick) {
      onDateClick(currentDate, filteredEvents);
    }
  };

  // View density classes
  const densityClasses = viewDensity === 'compact'
    ? 'min-h-[60px] md:min-h-[100px] max-h-[60px] md:max-h-[100px] p-1'
    : 'min-h-[80px] md:min-h-[120px] max-h-[80px] md:max-h-[120px] p-1 md:p-2';

  // Handle populated tiles
  return (
    <div
      onClick={handleClick}
      className={`w-full hover:cursor-pointer flex flex-col m-0.5 md:m-2 rounded-md border-solid border-2 border-neutral-400 hover:border-red-700 duration-100 overflow-hidden ${densityClasses} ${
        isToday ? 'md:border-red-700 md:ring-2 md:ring-red-600' : ''
      }`}
    >
      <p
        className={`text-sm md:text-base font-bold ${
          isToday ? 'text-red-700' : ''
        }`}
      >
        {day}
      </p>

      {/* Mobile view: Show only dots */}
      <div className="md:hidden flex flex-wrap gap-1">
        {filteredEvents.slice(0, 6).map((event, index) => (
          <div
            key={index}
            style={{ backgroundColor: event.color }}
            className="w-2 h-2 rounded-full"
            title={event.courseName || event.title}
          />
        ))}
        {filteredEvents.length > 6 && (
          <span className="text-[8px] text-gray-600 font-semibold ml-1">
            +{filteredEvents.length - 6}
          </span>
        )}
      </div>

      {/* Desktop view: Show full event details */}
      <div className="hidden md:block overflow-hidden space-y-1">
        {filteredEvents.slice(0, 3).map((event, index) => (
          <TileEvent key={index} event={event} timeFormat={timeFormat} viewDensity={viewDensity} />
        ))}
        {filteredEvents.length > 3 && (
          <p className="text-[10px] text-gray-600 font-semibold">
            +{filteredEvents.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}

// Define PropTypes
DateTile.propTypes = {
  day: PropTypes.number, // Day number or null for blank tiles
  month: PropTypes.number, // Month (0-11)
  year: PropTypes.number, // Full year
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string, // For backward compatibility
      courseName: PropTypes.string, // Preferred field
      days: PropTypes.string.isRequired, // e.g., "M,W,F" or "T,TH"
      time_start: PropTypes.string.isRequired,
      time_end: PropTypes.string,
      color: PropTypes.string.isRequired,
      periodStart: PropTypes.string, // Academic period start date
      periodEnd: PropTypes.string, // Academic period end date
      periodName: PropTypes.string, // e.g., "Fall 2025"
    })
  ),
  onDateClick: PropTypes.func, // Callback when date is clicked
  timeFormat: PropTypes.oneOf(['12h', '24h']),
  viewDensity: PropTypes.oneOf(['compact', 'default']),
};

// Export component
export default DateTile;
