# Academic Period Boundaries for Schedule Recurrence

## Overview

Schedules now respect academic period date boundaries. Events only appear on dates that fall within their associated academic period's `startAt` and `endAt` range, preventing schedules from recurring indefinitely.

## The Problem We Solved

**Before**: Schedules with recurring patterns (e.g., "M,W,F") would appear on **every** Monday, Wednesday, and Friday forever, regardless of semester/term boundaries.

**After**: Schedules only appear within their academic period's date range, automatically stopping when the semester ends.

## How It Works

### 1. Date Range Validation

Every time an event is checked for display, the system now validates:

1. **Day of Week Match**: Does the event occur on this day (e.g., Monday)?
2. **Academic Period Range**: Is this date within the period's start and end dates?

Both conditions must be true for the event to appear.

### 2. Updated Utility Function

New function in `scheduleUtils.js`:

```javascript
export const isDateInPeriod = (date, periodStart, periodEnd) => {
  if (!periodStart || !periodEnd) return true; // No restrictions

  const checkDate = new Date(date);
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);

  // Reset times to compare dates only
  checkDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return checkDate >= startDate && checkDate <= endDate;
};
```

### 3. Integration in Filtering

Both `getEventsForDate()` and `getEventsForTimeSlot()` now check period boundaries:

```javascript
export const getEventsForDate = (events, date) => {
  const dayOfWeek = date.getDay();
  return events.filter((event) => {
    const occursOnDay = eventOccursOnDay(event, dayOfWeek);
    const withinPeriod = isDateInPeriod(
      date,
      event.periodStart,
      event.periodEnd
    );
    return occursOnDay && withinPeriod; // Both must be true
  });
};
```

## Required Event Properties

All events must now include period date information:

```javascript
{
  title: 'A1: Basic German Course',
  days: 'M,W,F',              // Day recurrence pattern
  time_start: '10:00 AM',
  time_end: '11:00 AM',
  color: '#FFCF00',
  // REQUIRED for proper date boundaries
  periodStart: '2025-09-01',  // Academic period start date
  periodEnd: '2025-12-15',    // Academic period end date
  periodName: 'Fall 2025',    // Optional but recommended
}
```

## Examples

### Example 1: Fall Semester Schedule

```javascript
const event = {
  title: 'Introduction to Programming',
  days: 'T,TH',
  time_start: '2:00 PM',
  time_end: '3:30 PM',
  periodStart: '2025-09-01',
  periodEnd: '2025-12-15',
};
```

**Result**:

- Appears on Tuesdays and Thursdays from Sept 1 to Dec 15, 2025
- Does NOT appear on Dec 16, 2025 or later (even though it's a Tuesday)
- Does NOT appear on Aug 28, 2025 (even though it's a Thursday)

### Example 2: Spring Semester Schedule

```javascript
const event = {
  title: 'Advanced German',
  days: 'M,W,F',
  time_start: '10:00 AM',
  time_end: '11:00 AM',
  periodStart: '2026-01-15',
  periodEnd: '2026-05-20',
};
```

**Result**:

- Appears on M/W/F from Jan 15 to May 20, 2026
- Completely separate from Fall semester schedules
- Won't show on calendar views outside this date range

### Example 3: Multiple Periods

```javascript
const events = [
  {
    title: 'German A1',
    days: 'M,W',
    time_start: '10:00 AM',
    periodStart: '2025-09-01',
    periodEnd: '2025-12-15',
    periodName: 'Fall 2025',
  },
  {
    title: 'German A1', // Same course, different period
    days: 'M,W',
    time_start: '10:00 AM',
    periodStart: '2026-01-15',
    periodEnd: '2026-05-20',
    periodName: 'Spring 2026',
  },
];
```

**Result**: The same course appears in two different semesters with no overlap.

## Database Integration

### Prisma Query

When fetching schedules from the database, **you must include the period relation**:

```javascript
const schedules = await prisma.schedule.findMany({
  include: {
    course: true,
    teacher: true,
    period: true, // REQUIRED - includes startAt and endAt
  },
});
```

### Transform Function

The `transformScheduleToEvent()` function automatically extracts period dates:

```javascript
export const transformScheduleToEvent = (scheduleFromDB) => {
  const [time_start, time_end] = scheduleFromDB.time
    .split(' - ')
    .map((t) => t.trim());

  return {
    id: scheduleFromDB.id,
    title: scheduleFromDB.course?.name,
    days: scheduleFromDB.days,
    time_start,
    time_end,
    // Automatically extracted from period relation
    periodStart: scheduleFromDB.period?.startAt,
    periodEnd: scheduleFromDB.period?.endAt,
    periodName: scheduleFromDB.period?.periodName,
    // ... other fields
  };
};
```

## Edge Cases

### Missing Period Dates

If `periodStart` or `periodEnd` are `null` or `undefined`:

```javascript
if (!periodStart || !periodEnd) return true;
```

The event will appear on all matching days (no date restrictions). **Not recommended for production.**

### Date-Only Comparison

Times are reset to midnight for comparison:

```javascript
checkDate.setHours(0, 0, 0, 0);
startDate.setHours(0, 0, 0, 0);
endDate.setHours(0, 0, 0, 0);
```

This ensures:

- Events on the start date are included
- Events on the end date are included
- Time of day doesn't affect date range validation

### Cross-Year Periods

Periods spanning multiple years work correctly:

```javascript
{
  periodStart: '2025-11-01',
  periodEnd: '2026-03-31',
}
```

Events appear from November 2025 through March 2026.

## Testing

### Test Case 1: Event Within Period

- Date: October 6, 2025 (Monday)
- Event: M,W from Sept 1 to Dec 15
- **Expected**: Event appears ✅

### Test Case 2: Event Before Period

- Date: August 25, 2025 (Monday)
- Event: M,W from Sept 1 to Dec 15
- **Expected**: Event does NOT appear ✅

### Test Case 3: Event After Period

- Date: December 22, 2025 (Monday)
- Event: M,W from Sept 1 to Dec 15
- **Expected**: Event does NOT appear ✅

### Test Case 4: Wrong Day of Week

- Date: October 7, 2025 (Tuesday)
- Event: M,W from Sept 1 to Dec 15
- **Expected**: Event does NOT appear ✅

### Test Case 5: Period Boundary (Start Date)

- Date: September 1, 2025 (Monday)
- Event: M,W from Sept 1 to Dec 15
- **Expected**: Event appears ✅

### Test Case 6: Period Boundary (End Date)

- Date: December 15, 2025 (Monday)
- Event: M,W from Sept 1 to Dec 15
- **Expected**: Event appears ✅

## Files Modified

- ✅ `/client/src/utils/scheduleUtils.js` - Added `isDateInPeriod()` function
- ✅ `/client/src/utils/scheduleUtils.js` - Updated `getEventsForDate()` with period check
- ✅ `/client/src/utils/scheduleUtils.js` - Updated `getEventsForTimeSlot()` with period check
- ✅ `/client/src/utils/scheduleExamples.js` - Added period fields to transformation
- ✅ `/client/src/utils/scheduleExamples.js` - Updated example API response
- ✅ `/client/src/components/calendar/WeekView.js` - Updated PropTypes and default events
- ✅ `/client/src/components/calendar/DateTile.js` - Updated PropTypes and default events
- ✅ `/client/src/pages/admin/Schedule.js` - Added period dates to mock data
- ✅ `/SCHEDULE_RECURRING_LOGIC.md` - Updated documentation
- ✨ `/ACADEMIC_PERIOD_BOUNDARIES.md` - This file

## Benefits

1. **Automatic Semester Management**: No manual schedule cleanup needed between terms
2. **Data Integrity**: Schedules can't accidentally appear outside their valid period
3. **Multiple Semesters**: Same course can run in different periods without conflict
4. **Historical Accuracy**: Past schedules remain accurate for their time period
5. **Future Planning**: Can create schedules for future periods in advance

## Important Notes

⚠️ **API Requirement**: Your API endpoint **must** include the `period` relation with `startAt` and `endAt` fields.

⚠️ **Date Format**: Period dates can be ISO strings or Date objects - both are handled correctly.

⚠️ **Timezone**: Date comparisons use the user's local timezone. Ensure your database dates are stored in UTC and properly converted.

## Migration from Old System

If you have existing events without period dates:

1. Add `periodStart` and `periodEnd` to all event objects
2. Set appropriate academic period boundaries based on your calendar
3. Test thoroughly, especially around period boundaries
4. Update any API endpoints to include period relation

## Next Steps

1. Update your API endpoint to include period relation
2. Test with real academic period data
3. Add UI indicators showing which period is currently active
4. Consider adding period filters to show only current/upcoming periods
5. Add validation to prevent creating schedules outside their period range
