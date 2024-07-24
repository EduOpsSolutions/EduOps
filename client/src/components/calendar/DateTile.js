import React from 'react'
import PropTypes from 'prop-types'
import TileEvent from './TileEvent';

function DateTile({
                    day, 
                    year, 
                    month, 
                    day_of_week, 
                    events = [],
                    fade,
                    current,
                    mode
                  }
                  
                ) 
  {
    const maxEventsToShow = 3;
    const eventsToShow = events.slice(0, maxEventsToShow);
    const moreEventsCount = events.length - maxEventsToShow;
  
  return (
    <>
    { mode === 0?
    <div className={`hover:outline-red-600 ${current? 'bg-yellow-50': ''} hover:outline hover:outline-3 hover:border-opacity-0 transition duration-75 cursor-pointer flex flex-col m-0  p-2 2xl:w-[14.5rem] 2xl:h-[8rem] border-solid border border-neutral-400 ${fade === true? 'opacity-40 bg-slate-300':'opacity-100'}`}>
        <p className='text-xl'>{day}</p>
          {eventsToShow.map((element, index) => (
                <TileEvent key={index} event={element} />
            ))}
          {moreEventsCount > 0 && (
                <p className='hover:underline text-sm text-gray-500 text-end'>{moreEventsCount}+ more</p>
            )}
          
            
    </div>
    :
    <div className={`hover:outline-red-600 ${current? 'bg-yellow-50': ''} hover:outline hover:outline-3 hover:border-opacity-0 transition duration-75 cursor-pointer flex flex-col m-0  p-2 2xl:w-[14.5rem] 2xl:h-[32rem] border-solid border border-neutral-400 ${fade === true? 'opacity-40 bg-slate-300':'opacity-100'}`}>
      <p className='text-xl'>{day}</p>
    </div>
    
  }
    </>
    
  )
}

DateTile.propTypes = {
    day: PropTypes.number,
    year: PropTypes.number,
    month: PropTypes.number,
    day_of_week: PropTypes.number,
    events: PropTypes.array,
    fade: PropTypes.bool,
    current: PropTypes.bool,
    mode: PropTypes.number,
  };

export default DateTile
