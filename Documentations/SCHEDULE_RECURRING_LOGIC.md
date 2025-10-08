# Recurring Schedule Logic Implementation

## Overview

The calendar system has been updated to work with **recurring schedule patterns** instead of requiring separate event entries for each date. Events are now defined once with a `days` field (e.g., "M,W,F") and will automatically appear on all matching days of the week.

## Changes Made

### 1. **New Utility File: `scheduleUtils.js`**

Location: `/client/src/utils/scheduleUtils.js`

Contains reusable functions for handling recurring schedules:

- `dayAbbreviationMap` - Maps day abbreviations to JavaScript day indices
- `eventOccursOnDay()` - Checks if an event occurs on a specific day of week
- `getEventsForDate()` - Filters events for a specific date
- `parseTime()` - Parses time strings to hour/minute objects
- `getEventsForTimeSlot()` - Gets events for a specific time slot and date

### 2. **Updated Components**

#### WeekView Component

- Removed hardcoded date fields from events
- Now uses `days` field to determine which days events occur
- Automatically shows events on matching days of the week
- Uses utility functions from `scheduleUtils.js`

#### DateTile Component

- Added `month` and `year` props to calculate correct dates
- Filters events based on day-of-week recurrence pattern
- Uses utility functions from `scheduleUtils.js`

#### Calendar Component

- Updated to pass `month` and `year` props to DateTile components
- Ready to accept events with recurring patterns

### 3. **Example Files**

#### scheduleExamples.js

Location: `/client/src/utils/scheduleExamples.js`

Provides:

- `transformScheduleToEvent()` - Converts database schedule to calendar event format
- `generateColorForCourse()` - Generates consistent colors for courses
- Example API response structure
- Example transformed events

#### Schedule.js (Admin Page)

Location: `/client/src/pages/admin/Schedule.js`

Includes:

- Example recurring schedule events
- Documentation on how to integrate with API
- Ready-to-use event data structure

## Data Structure

### Event Object Format

```javascript
{
  title: 'A1: Basic German Course',
  days: 'M,W,F',              // Recurring days (comma-separated)
  time_start: '10:00 AM',     // Start time
  time_end: '11:00 AM',       // End time (optional)
  color: '#FFCF00',           // Display color
  // Academic period date range - REQUIRED for proper recurrence
  periodStart: '2025-09-01',  // Academic period start date
  periodEnd: '2025-12-15',    // Academic period end date
  periodName: 'Fall 2025',    // Period name (optional)
  // Optional fields from database:
  id: 1,
  courseId: 'course_123',
  periodId: 'period_456',
  teacherId: 'teacher_789',
}
```

### Important: Academic Period Boundaries

**Schedules only appear within their academic period date range.**

- Events with `periodStart: '2025-09-01'` and `periodEnd: '2025-12-15'` will **only** show on dates between September 1 and December 15, 2025
- Outside this range, the events will not appear, even if the day of week matches
- This ensures schedules don't continue indefinitely and respect semester/term boundaries
- If `periodStart` and `periodEnd` are omitted, events will appear on all matching days (not recommended for production)

### Day Abbreviations

The following abbreviations are supported:

- `SU` = Sunday
- `M` = Monday
- `T` = Tuesday
- `W` = Wednesday
- `TH` = Thursday
- `F` = Friday
- `S` = Saturday

**Multiple days:** Use comma-separated values (e.g., `"M,W,F"` or `"T,TH"`)

## Prisma Schema Alignment

The implementation matches your Prisma schema:

```prisma
model schedule {
  id        Int      @id @default(autoincrement())
  days      String   // "M,W,F" or "T,TH" format
  time      String   // "10:00 AM - 11:00 AM" format
  courseId  String?
  periodId  String?
  teacherId String?
  // ... relations
}
```

## Usage Example

### Basic Usage

```javascript
import Calendar from '../../components/calendar/Calendar';

function MySchedulePage() {
  const events = [
    {
      title: 'A1: Basic German Course',
      days: 'M,W', // Shows on Mondays and Wednesdays
      time_start: '10:00 AM',
      time_end: '11:00 AM',
      color: '#FFCF00',
      periodStart: '2025-09-01', // Only appears Sept 1 onwards
      periodEnd: '2025-12-15', // Only appears until Dec 15
      periodName: 'Fall 2025',
    },
  ];

  return <Calendar events={events} />;
}
```

### With API Integration

```javascript
import { useState, useEffect } from 'react';
import Calendar from '../../components/calendar/Calendar';
import { transformScheduleToEvent } from '../../utils/scheduleExamples';

function MySchedulePage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    // Fetch from your API - IMPORTANT: Include period relation
    // Example: /api/v1/schedules?include=period,course,teacher
    fetch('/api/v1/schedules')
      .then((res) => res.json())
      .then((data) => {
        // Transform database format to calendar format
        // transformScheduleToEvent automatically extracts periodStart/periodEnd
        const events = data.schedules.map((schedule) =>
          transformScheduleToEvent(schedule)
        );
        setSchedules(events);
      });
  }, []);

  return <Calendar events={schedules} />;
}
```

**Important**: Your API endpoint must include the `period` relation to get `startAt` and `endAt` dates. Without these dates, events may not display correctly.

## Benefits

1. **No Date Duplication**: Define a schedule once, it appears on all matching days
2. **Schema Alignment**: Works directly with your Prisma `schedule` model
3. **Efficient Storage**: Store recurring patterns instead of individual dates
4. **Easy Updates**: Change one record to update all occurrences
5. **Flexible Patterns**: Support any combination of days (M, T, W, TH, F, S, SU)

## Migration Notes

### Before (Old Approach)

```javascript
// Required separate entries for each date
{
  title: 'Course',
  date: new Date(2025, 9, 6),  // Monday
  time_start: '10:00 AM',
},
{
  title: 'Course',
  date: new Date(2025, 9, 8),  // Wednesday
  time_start: '10:00 AM',
}
```

### After (New Approach)

```javascript
// Single entry covers all Mondays and Wednesdays
{
  title: 'Course',
  days: 'M,W',  // Recurs every Monday and Wednesday
  time_start: '10:00 AM',
}
```

## Testing

The default events in the components demonstrate the recurring logic:

1. Navigate to the Schedule page
2. **Initial Load**: Observe the loading spinner while data is being fetched (1 second simulated delay)
3. **View Switching**: Click Month/Week buttons to see the transition spinner (300ms)
4. **Event Display**: Switch between Month and Week views to see events appearing on correct days
5. **Recurring Pattern**: Events with `days: 'M,W'` appear only on Mondays and Wednesdays

### Using the Spinner Component

The spinner can be used anywhere in your app:

```javascript
import Spinner from '../components/common/Spinner';

// Small spinner
<Spinner size="sm" />

// Medium spinner with message
<Spinner size="md" message="Loading..." />

// Large spinner with custom color
<Spinner size="lg" color="text-blue-500" message="Please wait..." />

// Extra large spinner
<Spinner size="xl" color="text-dark-red-2" message="Loading schedule data..." />
```

## Next Steps

1. **Create API Endpoint**: Fetch schedules from your database
2. **Implement Transform Function**: Use `transformScheduleToEvent()` or create your own
3. **Add Loading States**: Show loading indicators while fetching data
4. **Error Handling**: Handle API errors gracefully
5. **Filtering**: Add filters by period, course, or teacher
6. **CRUD Operations**: Add create/edit/delete functionality for schedules

## Loading States

The calendar system includes loading spinners for a better user experience:

### View Switching Spinner

When switching between Month and Week views:

- Shows a loading spinner during the transition
- Disables view buttons to prevent multiple clicks
- Smooth 300ms transition delay

### Data Fetching Spinner

When loading schedule data from the API:

- Full-screen spinner with "Loading schedule data..." message
- Displayed until data is fetched and processed
- Graceful error handling support

### Spinner Component

Reusable spinner component located at `/client/src/components/common/Spinner.js`:

- Configurable sizes: `sm`, `md`, `lg`, `xl`
- Customizable colors
- Optional loading message
- SVG-based with CSS animations

## Files Modified

- ✅ `/client/src/components/calendar/WeekView.js`
- ✅ `/client/src/components/calendar/DateTile.js`
- ✅ `/client/src/components/calendar/Calendar.js` - Added view switching spinner
- ✅ `/client/src/pages/admin/Schedule.js` - Added data fetching spinner

## Files Created

- ✨ `/client/src/utils/scheduleUtils.js`
- ✨ `/client/src/utils/scheduleExamples.js`
- ✨ `/client/src/components/common/Spinner.js` - Reusable spinner component
- ✨ `/SCHEDULE_RECURRING_LOGIC.md` (this file)
