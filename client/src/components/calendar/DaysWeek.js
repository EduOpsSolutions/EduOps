import PropTypes from 'prop-types';
import React from 'react';

function DaysWeek({ day = 1, title = "Day" }) {
  
  if (day <= -1) {
    return null;
  }
  
  return (
    <div className={`flex flex-col m-2 rounded-3xl p-2 items-center justify-center border-solid border-2 border-neutral-400`}>
        <p className='text-l font-bold'>{title}</p>
    </div>
  )
}

DaysWeek.propTypes = {
    day: PropTypes.number,
    title: PropTypes.string,
  };

export default DaysWeek
