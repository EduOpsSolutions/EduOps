import React, { useEffect, useRef, useState } from 'react';
import { FaGear } from "react-icons/fa6";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import DateTile from '../../components/calendar/DateTile';
import DaysWeek from './DaysWeek';

function Calendar(props) {
    const [current_month, setcurrent_month] = useState(new Date().getMonth());
    const [current_year, setcurrent_year] = useState(new Date().getFullYear());
    const [number_of_days, setnumber_of_days] = useState(0); 
    const [show_dropdown, setshow_dropdown] = useState(false);
    const [show_year_dropdown, setshow_year_dropdown] = useState(false);
    const current_year_ref = useRef(null);
    const year_range = Array.from({ length: 21 }, (_, i) => current_year - 10 + i);
    const [first_day, setfirst_day] = useState(0);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthName = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
    const daysInMonth = Array.from({ length: number_of_days }, (_, i) => i + 1);

    const calculateDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };
    

    // Calculate first day of the current month and number of days
    const updateMonthData = () => {
        const firstDay = new Date(current_year, current_month, 1).getDay();
        setfirst_day(firstDay);
        setnumber_of_days(calculateDaysInMonth(current_month + 1, current_year)); // Use the helper function here
    };
    

    const addMonth = () => {
        if (current_month < 11) {
            setcurrent_month(current_month + 1);
        } else {
            setcurrent_month(0);
            setcurrent_year(current_year + 1);
        }
    };

    const subMonth = () => {
        if (current_month > 0) {
            setcurrent_month(current_month - 1);
        } else {
            setcurrent_month(11);
            setcurrent_year(current_year - 1);
        }
    };

    const changeMonth = (num) => {
        if (num >= 0 && num < 12) {
            setcurrent_month(num);
        } else {
            setcurrent_month(0);
        }
        setshow_dropdown(false);
    };

    const addYear = () => {
        setcurrent_year(current_year + 1);
        setshow_year_dropdown(false);
    };

    const subYear = () => {
        setcurrent_year(current_year - 1);
        setshow_year_dropdown(false);
    };

    const changeYear = (num) => {
        if (num >= 1990 && num <= 3000) {
            setcurrent_year(num);
        } else {
            setcurrent_year(new Date().getFullYear());
        }
        setshow_year_dropdown(false);
    };

    const renderDateTiles = () => {
        const tiles = [];
        // Add empty tiles for offset (first day of the month)
        for (let i = 0; i < first_day; i++) {
            tiles.push(<DateTile key={`empty-${i}`} />);
        }
        // Add tiles for each day
        daysInMonth.forEach((day) => {
            tiles.push(<DateTile key={day} day={day} />);
        });
        return tiles;
    };

    useEffect(() => {
        updateMonthData();
    }, [current_month, current_year]);

    useEffect(() => {
        if (show_year_dropdown && current_year_ref.current) {
            current_year_ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        console.log("THE FIRST DAY BEH: ",weekdays[first_day])
    }, [show_year_dropdown]);
    
    
    
    return (
        <div>
            <div className='flex justify-center items-center w-full mt-2 flex-col'>
                <div className='items-center w-full mt-4 h-14 px-6 flex flex-row justify-center overflow-visible'> {/*div upper container*/}
                    <button className='mr-[4%] rounded-full p-2 border-none hover:border-slate-500 hover:border hover:bg-slate-300 transition duration-100'><FaGear size={'1.7vw'}/></button>
                    <div className='mx-4'>
                        <button onClick={()=>{
                            setshow_dropdown(!show_dropdown);
                            setshow_year_dropdown(false);
                        }}className="flex justify-between space-x-2 w-36 text-center text-white bg-dark-red-2 hover:bg-dark-red-3 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                            type="button">
                                {monthName[current_month]} 
                                <svg class="w-2.5 h-2.5 ms-3 flex" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                                </svg>
                        </button>
                        {show_dropdown &&
                        <div class=" absolute z-10 bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 border border-solid border-neutral-300 shadow">
                            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                <li>
                                    <button onClick={()=>changeMonth(0)} class={`${current_month === 0 ? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>January</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(1)}  class={`${current_month === 1? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>February</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(2)}  class={`${current_month === 2? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>March</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(3)}  class={`${current_month === 3? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>April</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(4)}  class={`${current_month === 4? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>May</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(5)}  class={`${current_month === 5? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>June</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(6)}  class={`${current_month === 6? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>July</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(7)} class={`${current_month === 7? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>August</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(8)} class={`${current_month === 8? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>September</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(9)} class={`${current_month === 9? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>October</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(10)} class={`${current_month === 10? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>November</button>
                                </li>
                                <li>
                                    <button onClick={()=>changeMonth(11)} class={`${current_month === 11? 'bg-dark-red-2 text-white':''} w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}>December</button>
                                </li>
                            </ul>
                        </div>
                        }
                    </div>
                    <div className='mx-4'>
                        <button onClick={()=>{
                            setshow_year_dropdown(!show_year_dropdown)
                            setshow_dropdown(false)
                        
                        }}className="text-center text-white bg-dark-red-2 hover:bg-dark-red-3  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
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
                                                className={`w-full text-start block px-4 py-2 cursor-pointer ${
                                                year === current_year
                                                ? 'bg-dark-red-2 text-white'
                                                : 'hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white'
                                            }`}
                                            >
                                            {year}
                                        
                                        </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className='mx-[10vw] flex flex-row'>
                        <button><MdNavigateBefore onClick={()=>{subMonth()}}className={'mx-[3vw] rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'} size={'1.8vw'}/></button>
                        <button><MdNavigateNext onClick={()=>{addMonth()}} className={'mx-[3vw] rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'} size={'1.8vw'}/></button>
                    </div>

                    <p className='mr-2 '>View:</p>
                    <div className='flex flex-row items-center w-1/5 h-[5vh] rounded-lg border border-black py-5'>
                        <button 
                            // onClick={()=>setmode(0)}
                            className='rounded-tr-none rounded-br-none w-full focus:outline-none border-rad hover:border-none text-white bg-dark-red-2 font-medium rounded-md text-sm px-5 py-2.5'>
                            Month
                        </button>
                        <button 
                            // onClick={()=>setmode(1)}
                            className='rounded-tl-none rounded-bl-none w-full focus:outline-none hover:bg-dark-red-3 hover:text-white text-german-red font-medium rounded-md text-sm px-5 py-2.5'>
                            Week
                        </button>
                        

                    </div>
                </div>
                {/*End of Top Section of Calendar*/}

                <div className='flex flex-col justify-center items-center mb-12 mt-2 w-11/12 p-5 border-2 border-black border-solid shadow-lg rounded-lg'>
                    <div >
                        <div className="grid grid-cols-7 gap-6 w-full">
                            {weekdays.map((day, index) => (
                                <DaysWeek key={index} day={index} title={day} />
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-6">
                            {renderDateTiles()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
    }

Calendar.propTypes = {}

export default Calendar
