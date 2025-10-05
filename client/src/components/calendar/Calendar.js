import React, { useEffect, useRef, useState } from 'react';
import { FaGear } from 'react-icons/fa6';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import DateTile from '../../components/calendar/DateTile';
import DaysWeek from './DaysWeek';
import WeekView from './WeekView';
import Spinner from '../common/Spinner';

function Calendar(schedule) {
  const { events = [], onDateTimeClick } = schedule;
  const [view_mode, setview_mode] = useState(0); // 0 = month, 1 = week
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [current_month, setcurrent_month] = useState(new Date().getMonth());
  const [current_year, setcurrent_year] = useState(new Date().getFullYear());
  const [current_week_start, setcurrent_week_start] = useState(new Date());
  const [number_of_days, setnumber_of_days] = useState(0);
  const [show_dropdown, setshow_dropdown] = useState(false);
  const [show_year_dropdown, setshow_year_dropdown] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const current_year_ref = useRef(null);
  const year_range = Array.from(
    { length: 21 },
    (_, i) => current_year - 10 + i
  );
  const [first_day, setfirst_day] = useState(0);
  const weekdays = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const monthName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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

  const changeYear = (num) => {
    if (num >= 1990 && num <= 3000) {
      setcurrent_year(num);
    } else {
      setcurrent_year(new Date().getFullYear());
    }
    setshow_year_dropdown(false);
  };

  // Handle view mode change with loading state
  const handleViewChange = (newMode) => {
    if (newMode === view_mode) return;

    setIsLoadingView(true);

    // Simulate a brief loading delay for smooth transition
    setTimeout(() => {
      setview_mode(newMode);
      setIsLoadingView(false);
    }, 300);
  };

  // Week navigation functions
  const getWeekDates = (startDate) => {
    const dates = [];
    const start = new Date(startDate);
    // Get the Sunday of the week
    const day = start.getDay();
    const diff = start.getDate() - day;
    const sunday = new Date(start.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const addWeek = () => {
    const newDate = new Date(current_week_start);
    newDate.setDate(newDate.getDate() + 7);
    setcurrent_week_start(newDate);
    // Update month and year based on the new week
    setcurrent_month(newDate.getMonth());
    setcurrent_year(newDate.getFullYear());
  };

  const subWeek = () => {
    const newDate = new Date(current_week_start);
    newDate.setDate(newDate.getDate() - 7);
    setcurrent_week_start(newDate);
    // Update month and year based on the new week
    setcurrent_month(newDate.getMonth());
    setcurrent_year(newDate.getFullYear());
  };

  const renderDateTiles = () => {
    const tiles = [];
    // Add empty tiles for offset (first day of the month)
    for (let i = 0; i < first_day; i++) {
      tiles.push(<DateTile key={`empty-${i}`} />);
    }
    // Add tiles for each day
    daysInMonth.forEach((day) => {
      tiles.push(
        <DateTile
          key={day}
          day={day}
          month={current_month}
          year={current_year}
          events={events}
          onDateClick={onDateTimeClick}
        />
      );
    });
    return tiles;
  };

  useEffect(() => {
    updateMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current_month, current_year]);

  useEffect(() => {
    if (show_year_dropdown && current_year_ref.current) {
      current_year_ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show_year_dropdown]);

  // Initialize current_week_start to the start of the current week
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const sunday = new Date(today.setDate(diff));
    setcurrent_week_start(sunday);
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const weekDates = getWeekDates(current_week_start);
  const weekStartMonth = weekDates[0].getMonth();
  const weekEndMonth = weekDates[6].getMonth();
  const displayMonth =
    weekStartMonth === weekEndMonth
      ? monthName[weekStartMonth]
      : `${monthName[weekStartMonth]} - ${monthName[weekEndMonth]}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-4 lg:px-6">
      <div className="flex justify-center items-center w-full mt-2 flex-col">
        <div className="items-center w-full mt-4 min-h-14 px-4 md:px-8 flex flex-col md:flex-row justify-center overflow-visible gap-2 md:gap-0">
          {' '}
          {/*div upper container*/}
          <button className="hidden md:block md:mr-4 rounded-full p-2 border-none hover:border-slate-500 hover:border hover:bg-slate-300 transition duration-100">
            <FaGear className="text-base md:text-lg lg:text-xl" />
          </button>
          <div className="mx-2 md:mx-4 relative">
            <button
              onClick={() => {
                setshow_dropdown(!show_dropdown);
                setshow_year_dropdown(false);
              }}
              className="flex justify-between space-x-2 w-32 md:w-36 text-center text-white bg-dark-red-2 hover:bg-dark-red-3 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 items-center"
              type="button"
            >
              <span className="truncate">
                {view_mode === 0 ? monthName[current_month] : displayMonth}
              </span>
              <svg
                className="w-2.5 h-2.5 ms-1 flex flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {show_dropdown && (
              <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg w-44 dark:bg-gray-700 border border-solid border-neutral-300 shadow">
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {monthName.map((month, index) => (
                    <li key={month}>
                      <button
                        onClick={() => changeMonth(index)}
                        className={`${
                          current_month === index
                            ? 'bg-dark-red-2 text-white'
                            : ''
                        } w-full text-start block px-4 py-2 hover:bg-dark-red-2 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white`}
                      >
                        {month}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mx-2 md:mx-4 relative">
            <button
              onClick={() => {
                setshow_year_dropdown(!show_year_dropdown);
                setshow_dropdown(false);
              }}
              className="text-center text-white bg-dark-red-2 hover:bg-dark-red-3  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900  focus:outline-none  font-medium rounded-lg text-xs md:text-sm px-3 md:px-5 py-2 md:py-2.5 inline-flex items-center"
              type="button"
            >
              {current_year}
              <svg
                className="w-2.5 h-2.5 ms-2 md:ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
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
          <div className="mx-2 md:mx-8 lg:mx-16 flex flex-row">
            <button>
              <MdNavigateBefore
                onClick={() => {
                  if (view_mode === 0) {
                    subMonth();
                  } else {
                    subWeek();
                  }
                }}
                className={
                  'mx-2 md:mx-4 lg:mx-6 rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'
                }
                size={windowWidth < 768 ? 24 : 28}
              />
            </button>
            <button>
              <MdNavigateNext
                onClick={() => {
                  if (view_mode === 0) {
                    addMonth();
                  } else {
                    addWeek();
                  }
                }}
                className={
                  'mx-2 md:mx-4 lg:mx-6 rounded-full hover:bg-german-red hover:bg-opacity-35 transition duration-100'
                }
                size={windowWidth < 768 ? 24 : 28}
              />
            </button>
          </div>
          <p className="mr-2 text-xs md:text-sm">View:</p>
          <div className="flex w-fit flex-row items-center rounded-lg border border-black">
            <button
              onClick={() => handleViewChange(0)}
              disabled={isLoadingView}
              className={`rounded-tr-none rounded-br-none w-full focus:outline-none border-rad hover:border-none font-medium rounded-md text-xs md:text-sm px-2 md:px-5 py-2 md:py-2.5 transition-colors ${
                view_mode === 0
                  ? 'text-white bg-dark-red-2'
                  : 'hover:bg-dark-red-3 hover:text-white text-german-red'
              } ${isLoadingView ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Month
            </button>
            <button
              onClick={() => handleViewChange(1)}
              disabled={isLoadingView}
              className={`rounded-tl-none rounded-bl-none w-full focus:outline-none font-medium rounded-md text-xs md:text-sm px-2 md:px-5 py-2 md:py-2.5 transition-colors ${
                view_mode === 1
                  ? 'text-white bg-dark-red-2'
                  : 'hover:bg-dark-red-3 hover:text-white text-german-red'
              } ${isLoadingView ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Week
            </button>
          </div>
        </div>
        {/*End of Top Section of Calendar*/}

        <div className="flex flex-col justify-center items-center mb-12 mt-4 w-full px-4 md:px-8 lg:px-12 py-5 border-2 border-black border-solid shadow-lg rounded-lg min-h-[500px]">
          {isLoadingView ? (
            <Spinner
              size="lg"
              color="text-dark-red-2"
              message="Switching view..."
              className="py-20"
            />
          ) : view_mode === 0 ? (
            <div className="w-full">
              <div className="grid grid-cols-7 gap-2 md:gap-3 lg:gap-4 w-full">
                {weekdays.map((day, index) => {
                  let mobileTitle = day.substring(0, 1); // Default to first letter
                  // Special cases for Thursday and Sunday
                  if (day === 'Thursday') mobileTitle = 'Th';
                  if (day === 'Sunday') mobileTitle = 'Su';

                  return (
                    <DaysWeek
                      key={index}
                      day={index}
                      title={windowWidth < 768 ? mobileTitle : day}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-3 lg:gap-4">
                {renderDateTiles()}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <WeekView
                weekDates={weekDates}
                events={events}
                onTimeSlotClick={onDateTimeClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
