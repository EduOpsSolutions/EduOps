import React from 'react'
import PropTypes from 'prop-types'
import TileEvent from './TileEvent';

function DateTile({
                    day = 1, 
                    year = 1990, 
                    month = 1, 
                    day_of_week = 1, 
                    events = [
                        {
                            title: "A1: Basic German Course",
                            time: "10:00 AM",
                            color: "#85df5b"
                        },
                        {
                            title: "A1: Basic German Course",
                            time: "1:30 PM",
                            color: "#f70483"
                        },
                        {
                            title: "A2: Basic German Course",
                            time: "1:30 PM",
                            color: "#f6bc00"
                        }

                    ]
}) {
  if (day < 0 ) {
    return null;
  }
  return (
    <div className={`flex flex-col m-2 rounded-md p-2 2xl:w-48 2xl:h-32 border-solid border-2 border-neutral-400`}>
        
        <p className='text-xl font-bold'>{day}</p>
            {events.map((element, index) => (
            <TileEvent key={index} event={element}/>
          ))}
          
            
    </div>
  )
}

DateTile.propTypes = {
    day: PropTypes.number,
    year: PropTypes.number,
    month: PropTypes.number,
    day_of_week: PropTypes.number,
    events: PropTypes.array
  };

export default DateTile
