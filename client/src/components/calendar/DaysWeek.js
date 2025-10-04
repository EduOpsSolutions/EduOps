import PropTypes from 'prop-types';
import React from 'react';

function DaysWeek({ day = 1, title = 'Day' }) {
  if (day <= -1) {
    return null;
  }

  return (
    <div
      className={`flex flex-col m-0.5 md:m-2 rounded-xl md:rounded-3xl p-1 md:p-2 items-center justify-center border-solid border-2 border-neutral-400`}
    >
      <p className="text-xs md:text-base lg:text-lg font-bold">{title}</p>
    </div>
  );
}

DaysWeek.propTypes = {
  day: PropTypes.number,
  title: PropTypes.string,
};

export default DaysWeek;
