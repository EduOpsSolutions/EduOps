import React from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';
import useAuthStore from '../../../stores/authStore';

/**
 * Date Select Modal - Shows all events for a selected day
 * Displays events in a timeline view organized by time slots
 */
function DateSelectModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  onEventClick,
}) {
  const { isAdmin } = useAuthStore();

  if (!isOpen) return null;

  // Generate 30-minute time slots from 6:00 AM to 9:00 PM
  const timeSlots = (() => {
    const slots = [];
    const startHour = 6;
    const endHour = 21;
    for (let h = startHour; h <= endHour; h++) {
      for (const m of [0, 30]) {
        const hour12 = ((h + 11) % 12) + 1;
        const period = h >= 12 ? 'PM' : 'AM';
        slots.push(`${hour12}:${m.toString().padStart(2, '0')} ${period}`);
      }
    }
    return slots;
  })();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventsForTimeSlot = (timeSlot) => {
    // 30-min slot window matching
    const [slotHourLabel, slotPeriod] = timeSlot.split(' ');
    const [slotH12, slotM] = slotHourLabel.split(':').map(Number);
    let h24 = slotH12 % 12;
    if (slotPeriod === 'PM') h24 += 12;
    const slotStart = h24 * 60 + slotM;
    const slotEnd = slotStart + 30;

    return events.filter((event) => {
      const [eh, em] = String(event.time_start).split(':').map(Number);
      const eventMinutes = eh * 60 + em;
      return eventMinutes >= slotStart && eventMinutes < slotEnd;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Date Select Modal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Date Display */}
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-black font-bold">
            {formatDate(selectedDate)}
          </p>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {/* Events Timeline */}
            <div className="relative">
              {timeSlots.map((timeSlot, index) => {
                const slotEvents = getEventsForTimeSlot(timeSlot);

                return (
                  <div
                    key={timeSlot}
                    className="grid grid-cols-[80px_1fr] gap-2 mb-2"
                  >
                    {/* Time Label */}
                    <div className="text-sm font-semibold text-gray-600 text-right pt-2">
                      {timeSlot}
                    </div>

                    {/* Events for this time slot */}
                    <div className="min-h-[60px] space-y-1">
                      {slotEvents.map((event, eventIndex) => {
                        // Support both courseName and title for backward compatibility
                        const displayTitle = event.courseName || event.title;

                        return (
                          <div
                            key={eventIndex}
                            onClick={() => onEventClick(event)}
                            style={{ backgroundColor: event.color }}
                            className="p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {displayTitle}
                            </p>
                            <p className="text-xs text-gray-700">
                              {event.time_start} - {event.time_end}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Add Button - Only visible for admin users */}
        {isAdmin() && (
          <div className={`p-4 border-t `}>
            <button
              onClick={() => onEventClick(null)} // null indicates creating new event
              className="w-full bg-dark-red-2 hover:bg-dark-red-3 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              + Add New Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

DateSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string, // For backward compatibility
      courseName: PropTypes.string, // Preferred field
      time_start: PropTypes.string.isRequired,
      time_end: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  onEventClick: PropTypes.func.isRequired,
};

export default DateSelectModal;
