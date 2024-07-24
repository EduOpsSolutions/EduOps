import React, {useEffect, useRef, useState} from 'react'
import PropTypes from 'prop-types'
import DateTile from '../../components/calendar/DateTile'
import daysInMonth from '@stdlib/time-days-in-month'
import { FaGear } from "react-icons/fa6";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import DaysWeek from './DaysWeek';
import {PulseLoader} from 'react-spinners'

function Calendar(props) {
    const [current_month, setcurrent_month] = useState(new Date().getMonth());
    const [current_year, setcurrent_year] = useState(new Date().getFullYear());
    const [current_day, setcurrent_day] = useState(new Date().getDate());
    const [number_of_days, setnumber_of_days] = useState(daysInMonth(current_month+1, current_year)); //since this is 1-12 based function
    const [show_dropdown, setshow_dropdown] = useState(false);
    const [show_year_dropdown, setshow_year_dropdown] = useState(false);
    const current_year_ref = useRef(null);
    const year_range = Array.from({ length: 21 }, (_, i) => current_year - 10 + i);
    const [mode, setmode] = useState(0);
    const [loading, setloading] = useState(false);
    const [events, setevents] = useState( [
        {
            day: 1,
            title: "A1: Basic German Course",
            time: "10:00 AM",
            color: "#85df5b"
        },
        {
            day: 12,
            title: "A1: Basic German Course",
            time: "1:30 PM",
            color: "#f70483"
        },
        {
            day: 12,
            title: "A1: Basic German Course",
            time: "3:00 PM",
            color: "#b89003"
        },
        {
            day: 12,
            title: "A1: Basic German Course",
            time: "3:00 PM",
            color: "#b89003"
        },
        {
            day: 12,
            title: "A1: Basic German Course",
            time: "3:00 PM",
            color: "#b89003"
        },
        {
            day: 6,
            title: "A2: Basic German Course",
            time: "1:30 PM",
            color: "#f6bc00"
        }]
    );
    const [first_day, setfirst_day] = useState(0);
    const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    const getFirstDay = ()=>{
        const data = String(new Date(current_year, current_month, 1)); //gets the day of the week for the 1st day of the month
        const week_day = data.split(" ");
        setfirst_day(weekdays.indexOf(week_day[0]));
        setnumber_of_days(daysInMonth(current_month+1, current_year));
    }
    const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const addMonth = () =>{
        if (current_month < 11){
            setcurrent_month(current_month + 1)
        }else{
            addYear()
            setcurrent_month(0)
        }
        setshow_dropdown(false)
        setshow_year_dropdown(false)
        getFirstDay()
        
    }
    const subMonth = () =>{
        if (current_month > 0){
            setcurrent_month(current_month - 1)
        }else{
            subYear();
            setcurrent_month(11)
        }
        getFirstDay()
        setshow_dropdown(false)
        setshow_year_dropdown(false)
    }

    const changeMonth = (num) =>{
        if (num >= 0 && num < 12){
            setcurrent_month(num)
        }else{
            setcurrent_month(1)
        }
        setshow_dropdown(false)
        setshow_year_dropdown(false)
        getFirstDay()
        
    }

    const addYear = () =>{
        setcurrent_year(current_year + 1)
        setshow_dropdown(false)
        setshow_year_dropdown(false)
        getFirstDay()
    }

    const subYear = () =>{
        setcurrent_year(current_year - 1)
        setshow_dropdown(false)
        setshow_year_dropdown(false)
        getFirstDay()
    }

    const changeYear = (num) =>{
        if (num >= 1990 && num <= 3000){
            setcurrent_year(num)
        }else{
            setcurrent_year(new Date().getFullYear());
        }
        setshow_year_dropdown(!show_year_dropdown);
        setshow_dropdown(false)
        getFirstDay()
    }


    const renderCalendarMonthTiles = () => {
        const tiles = [];
        const firstDayOfWeek = first_day; // First day of the current month
        const daysInPrevMonth = daysInMonth(current_month === 0 ? 12 : current_month, current_month === 0 ? current_year - 1 : current_year); // Number of days in the previous month
        const totalTiles = Math.ceil((number_of_days + firstDayOfWeek) / 7) * 7; // Total tiles to be rendered in the calendar view (multiples of 7)

        // Fill the preceding days of the previous month
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            tiles.push(<DateTile day={daysInPrevMonth - i} fade={true} key={`prev-${i}`} mode={mode}/>);
        }

        // Fill the days of the current month
        for (let i = 1; i <= number_of_days; i++) {
            const dayEvents = events.filter(event => event.day === i);
            tiles.push(<DateTile day={i} key={`current-${i}`} events={dayEvents} current={i === current_day? true:false}  mode={mode}/>);
        }

        // Fill the remaining days to complete the last week
        const remainingTiles = totalTiles - tiles.length;
        for (let i = 1; i <= remainingTiles; i++) {
            tiles.push(<DateTile day={i} key={`next-${i}`} fade={true}  mode={mode}/>);
        }

        return tiles;
    }

    const renderCalendarWeekTiles = () => {
        const tiles = [];
        const startOfWeek = new Date().getDate() - new Date().getDay();
        const endOfWeek = startOfWeek + 6;

        for (let i = startOfWeek; i <= endOfWeek; i++) {
            const date = new Date(current_year, current_month, i);
            const day = date.getDate();
            const isCurrentMonth = date.getMonth() === current_month;
            const fade = !isCurrentMonth;
            const dayEvents = events.filter(event => event.day === day);

            tiles.push(<DateTile day={day} key={`current-${day}`} events={dayEvents} fade={fade} current={i === current_day? true:false} mode={mode}/>);
        }

        return tiles;
    };

    useEffect (()=>{
        if (show_year_dropdown && current_year_ref.current) {
            current_year_ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          getFirstDay();
    }, [number_of_days, current_year, current_month]);



  return (
    <div className='w-[95%]'>
        <div className='mt-2 flex-col'>
            <div className='items-center w-full mt-4  h-14 px-6 flex flex-row overflow-visible'> {/*div upper container*/}
                <button className='mr-[4%] rounded-full p-2 border-none hover:border-slate-500 hover:border hover:bg-slate-300 transition duration-100'><FaGear size={'1.7vw'}/></button>
                <div className='w-[10%] mx-2'>
                    <button onClick={()=>{
                        setshow_dropdown(!show_dropdown);
                        setshow_year_dropdown(false);
                    }}className="w-[100%] text-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                        type="button">
                            {monthName[current_month]} 
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                            </svg>
                    </button>
                    {show_dropdown &&
                        <div className="w-28 overflow-y-auto h-44 absolute z-10 bg-white divide-y divide-gray-100 rounded-lg dark:bg-gray-700 border border-solid border-neutral-300 shadow">
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                <li><button onClick={()=>changeMonth(0)} className={`${current_month == 0? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>January</button></li>
                                <li><button onClick={()=>changeMonth(1)}  className={`${current_month == 1? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>February</button></li>
                                <li><button onClick={()=>changeMonth(2)}  className={`${current_month == 2? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>March</button></li>
                                <li><button onClick={()=>changeMonth(3)}  className={`${current_month == 3? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>April</button></li>
                                <li><button onClick={()=>changeMonth(4)}  className={`${current_month == 4? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>May</button></li>
                                <li><button onClick={()=>changeMonth(5)}  className={`${current_month == 5? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>June</button></li>
                                <li><button onClick={()=>changeMonth(6)}  className={`${current_month == 6? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>July</button></li>
                                <li><button onClick={()=>changeMonth(7)} className={`${current_month == 7? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>August</button></li>
                                <li><button onClick={()=>changeMonth(8)} className={`${current_month == 8? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>September</button></li>
                                <li><button onClick={()=>changeMonth(9)} className={`${current_month == 9? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>October</button></li>
                                <li><button onClick={()=>changeMonth(10)} className={`${current_month == 10? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>November</button></li>
                                <li><button onClick={()=>changeMonth(11)} className={`${current_month == 11? 'bg-red-500 text-white':''} w-full text-start block px-4 py-2 hover:bg-red-500 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>December</button></li>
                            </ul>
                        </div>
                    }
                </div>
                <div className='mx-4 w-1/3'>
                    <button onClick={()=>{
                        setshow_year_dropdown(!show_year_dropdown)
                        setshow_dropdown(false)
                    
                    }}className=" w-28 text-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                        type="button">
                            {current_year} 
                            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                            </svg>
                    </button>
                    {show_year_dropdown && (
                        <div className="w-28 absolute z-10 bg-white divide-y divide-gray-100 rounded-lg dark:bg-gray-700 border border-solid border-neutral-300 shadow">
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

                <div className='flex-row flex w-1/3 items-center'>
                    <button><MdNavigateBefore onClick={()=>{subMonth()}}className={' rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'} size={'1.8vw'}/></button>
                    <p className='text-lg text-center font-bold w-[15rem]'>{monthName[current_month] } - {current_year}</p>
                    <button><MdNavigateNext onClick={()=>{addMonth()}} className={' rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'} size={'1.8vw'}/></button>
                </div>

                <div className='flex flex-row justify-center items-center w-1/3 h-[5vh] rounded-lg'>
                    <p className='mr-2 '>View:</p>
                    <button 
                        onClick={()=>setmode(0)}
                        className={`rounded-tr-none rounded-br-none w-[7rem] focus:outline-none text-white hover:bg-yellow-50 hover:text-black hover:border-2  font-medium rounded-md text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 ${mode == 0? 'bg-red-700' : 'bg-red-200 text-black'}`}>
                        Month
                    </button>
                    <button 
                        onClick={()=>setmode(1)}
                        className={`rounded-tl-none rounded-bl-none w-[7rem] focus:outline-none text-white  hover:bg-yellow-50 hover:text-black hover:border-2 font-medium rounded-md text-sm px-5 py-2.5  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 ${mode != 0? 'bg-red-700' : 'bg-red-200 text-black'}`}>
                        Week
                    </button>
                    

                </div>
            </div>
            {/*End of Top Section of Calendar*/}

            <div className='flex flex-col justify-center items-center mt-2 p-5 border border-solid shadow-lg rounded-lg'> {/*This is the main box container*/}
                
                <div className='flex flex-row flex-wrap justify-center'>
                    <DaysWeek day={0} title={'Sunday'}/>
                    <DaysWeek day={1} title={'Monday'}/>
                    <DaysWeek day={2} title={'Tuesday'}/>
                    <DaysWeek day={3} title={'Wednesday'}/>
                    <DaysWeek day={4} title={'Thursday'}/>
                    <DaysWeek day={5} title={'Friday'}/>
                    <DaysWeek day={6} title={'Saturday'}/> 
                    { loading? 
                        <div className='w-full h-80 items-center justify-center flex flex-col'>
                        <PulseLoader 
                            size='1rem'
                            color='red'
                        />
                        <p className=' animate-pulse duration-75 mt-2'>Loading</p>
                        </div>
                    :
                    mode === 0? renderCalendarMonthTiles() :renderCalendarWeekTiles() 
                    }
                </div>   
            </div>
        </div>
    </div>
  )
}

Calendar.propTypes = {}

export default Calendar
