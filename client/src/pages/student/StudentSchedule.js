import React from 'react'
import Calendar from '../../components/calendar/Calendar'

function StudentSchedule() {
    
  return (
    <div className='flex flex-col justify-center items-center'>
      <p className='text-[2.5rem] w-full text-start px-12 pt-2'>Student Schedule</p>
      
        <Calendar/>
        <p className='w-full text-start px-12 py-3 text-xs'>Timezone: UTC +8, Philippines</p>
    </div>
  )
}

export default StudentSchedule