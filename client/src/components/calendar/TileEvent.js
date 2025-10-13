import PropTypes from 'prop-types';
import React from 'react';
import { convertTo12Hour } from '../../utils/scheduleUtils';

function TileEvent({ event }) {
  // Support both courseName and title for backward compatibility
  const displayTitle = event.courseName || event.title;

  // Convert times to 12-hour format
  const displayStartTime = convertTo12Hour(event.time_start);
  const displayEndTime = event.time_end ? convertTo12Hour(event.time_end) : '';

  return (
    <div
      style={{ backgroundColor: event.color }}
      className="w-full min-h-[20px] max-h-[30px] px-1 rounded-md overflow-hidden flex items-center"
    >
      <span className="font-bold text-[8px] sm:text-[6px] md:text-[7px] lg:text-[7px] xl:text-[12px] text-ellipsis whitespace-nowrap">
        {displayStartTime + ' - '}
      </span>
      {displayEndTime && (
        <span className="font-bold text-[8px] sm:text-[6px] md:text-[7px] lg:text-[7px] xl:text-[12px] text-ellipsis whitespace-nowrap">
          {displayEndTime + ' - '}
        </span>
      )}
      <span className="text-[8px] sm:text-[6px] md:text-[7px] lg:text-[7px] xl:text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
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
};

export default TileEvent;
