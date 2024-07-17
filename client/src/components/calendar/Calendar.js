import React, {useEffect, useRef, useState} from 'react'
import PropTypes from 'prop-types'
import DateTile from '../../components/calendar/DateTile'
import daysInMonth from '@stdlib/time-days-in-month'
import { FaGear } from "react-icons/fa6";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import DaysWeek from './DaysWeek';

function Calendar(props) {
    const [current_month, setcurrent_month] = useState(new Date().getMonth());
    const [current_year, setcurrent_year] = useState(new Date().getFullYear());
    const [number_of_days, setnumber_of_days] = useState(daysInMonth(current_month+1, current_year)); //since this is 1-12 based function
    const [show_dropdown, setshow_dropdown] = useState(false);
    const [show_year_dropdown, setshow_year_dropdown] = useState(false);
    const current_year_ref = useRef(null);
    const year_range = Array.from({ length: 21 }, (_, i) => current_year - 10 + i);
    const [mode, setmode] = useState(0);

    const monthName = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    const addMonth = () =>{
        if (current_month < 11){
            setcurrent_month(current_month + 1)
        }else{
            addYear()
            setcurrent_month(0)
        }
        
    }
    const subMonth = () =>{
        if (current_month > 0){
            setcurrent_month(current_month - 1)
        }else{
            subYear()
            setcurrent_month(11)
        }
        
    }

    const changeMonth = (num) =>{
        if (num >= 0 && num < 12){
            setcurrent_month(num)
        }else{
            setcurrent_month(1)
        }
        setshow_dropdown(false)
        setshow_year_dropdown(false)
        
    }

    const addYear = () =>{
        setcurrent_year(current_year + 1)
    }

    const subYear = () =>{
        setcurrent_year(current_year - 1)
    }

    const changeYear = (num) =>{
        if (num >= 1990 && num <= 3000){
            setcurrent_year(num)
        }else{
            setcurrent_year(new Date().getFullYear());
        }
        setshow_year_dropdown(!show_year_dropdown);
        setshow_dropdown(false)
    }


    useEffect (()=>{
        if (show_year_dropdown && current_year_ref.current) {
            current_year_ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
    }, [number_of_days]);



  return (
    <div>
        <div className='w-full mt-2 flex-col'>
            <div className='items-center w-full mt-4  h-14 px-6 flex flex-row overflow-visible'> {/*div upper container*/}
                <button className='mr-[4%] rounded-full p-2 border-none hover:border-slate-500 hover:border hover:bg-slate-300 transition duration-100'><FaGear size={'1.7vw'}/></button>
                <div className='w-[10%] mx-2'>
                    <button onClick={()=>{
                        setshow_dropdown(!show_dropdown);
                        setshow_year_dropdown(false);
                    }}className="w-[100%] text-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                        type="button">
                            {monthName[current_month]} 
                            <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                    </button>
                    {show_dropdown &&
                        <div class=" absolute z-10 bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 border border-solid border-neutral-300 shadow">
                        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                        <li>
                            <button onClick={()=>changeMonth(0)} class={`${current_month == 0? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>January</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(1)}  class={`${current_month == 1? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>February</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(2)}  class={`${current_month == 2? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>March</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(3)}  class={`${current_month == 3? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>April</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(4)}  class={`${current_month == 4? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>May</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(5)}  class={`${current_month == 5? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>June</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(6)}  class={`${current_month == 6? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>July</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(7)} class={`${current_month == 7? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>August</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(8)} class={`${current_month == 8? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>September</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(9)} class={`${current_month == 9? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>October</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(10)} class={`${current_month == 10? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>November</button>
                        </li>
                        <li>
                            <button onClick={()=>changeMonth(11)} class={`${current_month == 11? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>December</button>
                        </li>
                        </ul>
                    </div>
                    }
                </div>
                <div className='mx-4'>
                    <button onClick={()=>{
                        setshow_year_dropdown(!show_year_dropdown)
                        setshow_dropdown(false)
                    
                    }}className="=text-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                        type="button">
                            {current_year} 
                            <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                            </svg>
                    </button>
                    {show_year_dropdown && (
                        <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 border border-solid border-neutral-300 shadow">
                            <ul
                                className="py-2 text-sm text-gray-700 dark:text-gray-200 max-h-64 overflow-y-auto"
                                aria-labelledby="dropdownDefaultButton"
                            >
                                    {year_range.map((year) => (
                                    <li 
                                            key={year}
                                            ref={year === current_year ? current_year_ref : null}
                                            onClick={() => changeYear(year)}
                                            className={`w-full text-start block px-4 py-2 ${
                                            year === current_year
                                            ? 'bg-red-500 text-white'
                                            : 'hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white'
                                        }`}
                                        >
                                        {year}
                                    
                                    </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className='mx-[10vw]'>
                    <button><MdNavigateBefore onClick={()=>{subMonth()}}className={'mx-[3vw] rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'} size={'1.8vw'}/></button>
                    <button><MdNavigateNext onClick={()=>{addMonth()}} className={'mx-[3vw] rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'} size={'1.8vw'}/></button>
                </div>

                <div className='flex flex-row items-center w-[20%] h-[5vh] rounded-lg'>
                    <p className='mr-2 '>View:</p>
                    <button 
                        onClick={()=>setmode(0)}
                        class={`rounded-tr-none rounded-br-none w-[7rem] focus:outline-none text-white hover:bg-yellow-50 hover:text-black hover:border-2  font-medium rounded-md text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 ${mode == 0? 'bg-red-700' : 'bg-red-200 text-black'}`}>
                        Month
                    </button>
                    <button 
                        onClick={()=>setmode(1)}
                        class={`rounded-tl-none rounded-bl-none w-[7rem] focus:outline-none text-white  hover:bg-yellow-50 hover:text-black hover:border-2 font-medium rounded-md text-sm px-5 py-2.5  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 ${mode != 0? 'bg-red-700' : 'bg-red-200 text-black'}`}>
                        Week
                    </button>
                    

                </div>
            </div>
            {/*End of Top Section of Calendar*/}

            <div className='flex flex-col items-center mt-2 w-[80vw] p-5 border border-solid shadow-lg rounded-lg'> {/*This is the main box container*/}
                
                <div className='flex flex-row'>
                    <DaysWeek day={0} title={'Sunday'}/>
                    <DaysWeek day={1} title={'Monday'}/>
                    <DaysWeek day={2} title={'Tuesday'}/>
                    <DaysWeek day={3} title={'Wednesday'}/>
                    <DaysWeek day={4} title={'Thursday'}/>
                    <DaysWeek day={5} title={'Friday'}/>
                    <DaysWeek day={6} title={'Saturday'}/>
                </div>
                <div className='flex flex-row'>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                </div>
                
                <div className='flex flex-row'>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                </div>

                
                <div className='flex flex-row'>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                </div>

                
                <div className='flex flex-row'>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                    <DateTile/>
                </div>
                </div>
        </div>
    </div>
  )
}

Calendar.propTypes = {}

export default Calendar
