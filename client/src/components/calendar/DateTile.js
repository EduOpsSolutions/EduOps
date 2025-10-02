import PropTypes from 'prop-types';
import React from 'react';
import TileEvent from './TileEvent';

// Replace with logic of getting the events of that day
const defaultEvents = [
  {
    title: 'A1: Basic German Course',
    time: '10:00 AM',
    color: '#FFCF00',
  },
  {
    title: 'A1: Basic German Course',
    time: '1:30 PM',
    color: '#0099FF',
  },
  {
    title: 'A2: Basic German Course',
    time: '1:30 PM',
    color: '#29CC6A',
  },
];

function DateTile({ day = null, events = defaultEvents }) {
  // Handle blank tiles (day === null)
  if (day === null) {
    return (
      <div className="hover:cursor-pointer flex flex-col m-2 rounded-md p-2 border-solid border-2 border-neutral-400 hover:border-red-700 duration-100">
        {/* Blank tile */}
      </div>
    );
  }

  // Handle populated tiles
  return (
    <div className="hover:cursor-pointer flex flex-col m-2 rounded-md p-2 border-solid border-2 border-neutral-400 hover:border-red-700 duration-100 min-h-[120px] max-h-[120px] overflow-hidden">
      <p className="text-base font-bold">{day}</p>
      <div className="overflow-hidden">
        <div></div>
        {events.map((event, index) => (
          <TileEvent key={index} event={event} />
        ))}
      </div>
    </div>
  );
}

// Define PropTypes
DateTile.propTypes = {
  day: PropTypes.number, // Day number or null for blank tiles
  events: PropTypes.array, // List of event objects
};

// Export component
export default DateTile;
