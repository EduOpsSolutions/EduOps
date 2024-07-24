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
    <div className={`hover:bg-red-100 items-center transition duration-75 cursor-pointer flex flex-col m-0  p-2 2xl:w-[14.5rem] border-solid border border-neutral-400`}>
        
        <p className='text-l font-bold'>{title}</p>
    </div>
  )
}

DaysWeek.propTypes = {
    day: PropTypes.number,
    title: PropTypes.string,
  };

export default DaysWeek
