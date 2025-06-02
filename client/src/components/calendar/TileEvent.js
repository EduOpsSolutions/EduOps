import PropTypes from 'prop-types';
import React from 'react';

function TileEvent({ event }) {
  return (
    <div
      style={{ backgroundColor: event.color }}
      className="w-full min-h-[20px] max-h-[30px] px-1 rounded-md overflow-hidden flex items-center"
    >
      <span className="font-bold text-[8px] sm:text-[6px] md:text-[7px] lg:text-[7px] xl:text-[12px] text-ellipsis whitespace-nowrap">
        {event.time + ' '}
      </span>
      -{' '}
      <span className="text-[8px] sm:text-[6px] md:text-[7px] lg:text-[7px] xl:text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
        {event.title}
      </span>
    </div>
  );
}

TileEvent.propTypes = {
  event: PropTypes.shape({
    time: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }),
};

export default TileEvent;
