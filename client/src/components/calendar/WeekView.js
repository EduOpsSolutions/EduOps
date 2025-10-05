import PropTypes from 'prop-types';
import React from 'react';
import TileEvent from './TileEvent';
import { getEventsForTimeSlot as getEventsForTimeSlotUtil } from '../../utils/scheduleUtils';

function WeekView({ weekDates, events = [], onTimeSlotClick }) {
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const timeSlots = [
    '6:00 AM',
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
    '9:00 PM',
  ];

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForTimeSlot = (timeSlot, date) => {
    return getEventsForTimeSlotUtil(events, timeSlot, date);
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Week Header - Desktop */}
      <div className="hidden md:grid md:grid-cols-8 gap-2 mb-4 sticky top-0 bg-white z-0">
        <div className="p-2"></div> {/* Empty cell for time column */}
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${
              isToday(date)
                ? 'bg-dark-red-2 text-white border-dark-red-3'
                : 'border-neutral-300 bg-gray-50'
            }`}
          >
            <p className="text-xs font-semibold">{weekdays[date.getDay()]}</p>
            <p
              className={`text-2xl font-bold ${
                isToday(date) ? 'text-white' : ''
              }`}
            >
              {date.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Week Header - Mobile (Horizontal Scroll) */}
      <div className="md:hidden flex overflow-x-auto gap-2 mb-4 pb-2 snap-x snap-mandatory">
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-20 flex flex-col items-center justify-center p-3 rounded-lg border-2 snap-center ${
              isToday(date)
                ? 'bg-dark-red-2 text-white border-dark-red-3'
                : 'border-neutral-300 bg-gray-50'
            }`}
          >
            <p className="text-xs font-semibold">
              {weekdays[date.getDay()].substring(0, 3)}
            </p>
            <p
              className={`text-xl font-bold ${
                isToday(date) ? 'text-white' : ''
              }`}
            >
              {date.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Time Grid - Desktop */}
      <div className="hidden md:block">
        {timeSlots.map((time, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-2 text-sm font-semibold text-gray-600 text-right">
              {time}
            </div>
            {weekDates.map((date, dayIndex) => {
              const eventsForSlot = getEventsForTimeSlot(time, date);
              return (
                <div
                  key={dayIndex}
                  onClick={() =>
                    onTimeSlotClick && onTimeSlotClick(date, eventsForSlot)
                  }
                  className="border-2 border-neutral-200 rounded-md p-2 min-h-[80px] hover:border-red-700 hover:bg-gray-50 transition-colors duration-100 cursor-pointer"
                >
                  {eventsForSlot.map((event, eventIndex) => (
                    <TileEvent key={eventIndex} event={event} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile Day View */}
      <div className="md:hidden space-y-4">
        {weekDates.map((date, dayIndex) => (
          <div
            key={dayIndex}
            className="border-2 border-neutral-300 rounded-lg p-3"
          >
            <h3 className="font-bold text-lg mb-3 text-dark-red-2">
              {weekdays[date.getDay()]}, {date.getDate()}
            </h3>
            <div className="space-y-2">
              {timeSlots.map((time, timeIndex) => {
                const eventsForSlot = getEventsForTimeSlot(time, date);
                return (
                  <div
                    key={timeIndex}
                    className="flex items-start border-b border-neutral-200 pb-2"
                  >
                    <div className="w-20 text-xs font-semibold text-gray-600 pt-1">
                      {time}
                    </div>
                    <div className="flex-1 min-h-[40px] space-y-1">
                      {eventsForSlot.map((event, eventIndex) => (
                        <TileEvent key={eventIndex} event={event} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

WeekView.propTypes = {
  weekDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
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
  onTimeSlotClick: PropTypes.func, // Callback when time slot is clicked
};

export default WeekView;
