import React from 'react'
import PropTypes from 'prop-types'

function TileEvent({event}) {
  return (
    <div
        style={{
            backgroundColor: event.color
        }} 
        className={`w-[100%] 2xl:h-6 lg:h-2 2xl:p-1 lg:p-1 text-[0.6vw] overflow-hidden bg-[${event.color}]`}>
          <span className='font-bold'>{event.time + ' '} </span>
          - 
          {' '+ event.title}
          </div>
  )
}

TileEvent.propTypes = {
    event:PropTypes.object,
    color:PropTypes.string
}

export default TileEvent