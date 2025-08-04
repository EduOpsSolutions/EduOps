'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Calendar } from '../ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

export function DatePicker({ date, setDate, onChange }) {
  // Use internal state as fallback if no props provided
  const [internalDate, setInternalDate] = React.useState();

  // Use props if provided, otherwise use internal state
  const currentDate = date !== undefined ? date : internalDate;
  const updateDate = (newDate) => {
    if (setDate) {
      setDate(newDate);
    } else {
      setInternalDate(newDate);
    }

    // Call onChange if provided
    if (onChange) {
      onChange({ target: { value: newDate } });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!currentDate}
          className={`py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 data-[empty=true]:text-muted-foreground justify-start text-left w-full`}
        >
          <CalendarIcon />
          {currentDate ? format(currentDate, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white">
        <Calendar mode="single" selected={currentDate} onSelect={updateDate} />
      </PopoverContent>
    </Popover>
  );
}
