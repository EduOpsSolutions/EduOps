import React from 'react'
import PropTypes from 'prop-types'
import TileEvent from './TileEvent';

function DaysWeek({
                    day = 1, 
                    title = "Day"
}) {
  if (day <= -1) {
    return null;
  }
  return (
    <div className={`flex flex-col m-2 rounded-md p-2 2xl:w-48 2xl:h-8 items-center justify-center border-solid border-2 border-neutral-400`}>
        
        <p className='text-l font-bold'>{title}</p>
    </div>
  )
}

DaysWeek.propTypes = {
    day: PropTypes.number,
    title: PropTypes.string,
  };

export default DaysWeek
