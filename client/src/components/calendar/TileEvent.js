import PropTypes from 'prop-types';
import React from 'react';
import { formatTime } from '../../utils/scheduleUtils';

function TileEvent({ event, timeFormat = '12h', viewDensity = 'default' }) {
  // Support both courseName and title for backward compatibility
  const displayTitle = event.courseName || event.title;

  // Format times based on user preference
  const displayStartTime = formatTime(event.time_start, timeFormat);
  const displayEndTime = event.time_end ? formatTime(event.time_end, timeFormat) : '';

  // View density styling
  const densityClasses = viewDensity === 'compact'
    ? 'min-h-[16px] max-h-[24px] px-1 text-[7px] sm:text-[6px] md:text-[6px] lg:text-[7px] xl:text-[10px]'
    : 'min-h-[20px] max-h-[30px] px-1 text-[8px] sm:text-[6px] md:text-[7px] lg:text-[7px] xl:text-[12px]';

  return (
    <div
      style={{ backgroundColor: event.color }}
      className={`w-full ${densityClasses} rounded-md overflow-hidden flex items-center`}
    >
      <span className="font-bold text-ellipsis whitespace-nowrap">
        {displayStartTime + ' - '}
      </span>
      {displayEndTime && (
        <span className="font-bold text-ellipsis whitespace-nowrap">
          {displayEndTime + ' - '}
        </span>
      )}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {displayTitle}
      </span>
    </div>
  );
}

TileEvent.propTypes = {
  event: PropTypes.shape({
    time_start: PropTypes.string.isRequired,
    time_end: PropTypes.string,
    title: PropTypes.string, // For backward compatibility
    courseName: PropTypes.string, // Preferred field
    color: PropTypes.string.isRequired,
  }),
  timeFormat: PropTypes.oneOf(['12h', '24h']),
  viewDensity: PropTypes.oneOf(['compact', 'default']),
};

export default TileEvent;
