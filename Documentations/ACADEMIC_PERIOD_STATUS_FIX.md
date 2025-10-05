# Academic Period Status Fix

## Problem

The academic period `status` field in the database was causing confusion because it tracks **enrollment status** (whether new enrollments are accepted), not the **actual academic period status** (whether classes are ongoing).

### Previous Behavior

- When an admin called "End Enrollment" for a period, the database `status` field was set to `'ended'`
- The UI would then display the period as "Ended", implying the entire academic period (classes/semester) was over
- This was misleading because:
  - Classes could still be ongoing
  - The period dates (`startAt` - `endAt`) might still be in the current date range
  - Students and teachers would see "Ended" but classes are still happening

### Example Scenario

```
Academic Period: Fall 2025
Start Date: September 1, 2025
End Date: December 15, 2025
Current Date: October 15, 2025

Admin clicks "End Enrollment" on October 1, 2025
Database status = 'ended'

❌ OLD: UI shows "Ended" (confusing - classes are still happening!)
✅ NEW: UI shows "Ongoing (Enrollment Closed)" (clear and accurate)
```

## Solution

The system now **separates two concepts**:

1. **Period Status** - Based on dates (`startAt` and `endAt`)

   - `Upcoming` - Current date is before `startAt`
   - `Ongoing` - Current date is between `startAt` and `endAt`
   - `Ended` - Current date is after `endAt`

2. **Enrollment Status** - Based on database `status` field

   - `Open` - When `status` is `'upcoming'` or `'ongoing'`
   - `Closed` - When `status` is `'ended'`

3. **Display Status** - Combines both for clarity
   - `"Upcoming"` - Period hasn't started, enrollment open
   - `"Upcoming (Enrollment Closed)"` - Period hasn't started, enrollment closed
   - `"Ongoing"` - Period active, enrollment open
   - `"Ongoing (Enrollment Closed)"` - Period active, enrollment closed ← **This fixes the confusion!**
   - `"Ended"` - Period finished (classes done)

## Changes Made

### 1. Schedule Page (`client/src/pages/admin/Schedule.js`)

**Lines 193-227**: Updated academic period status calculation

```javascript
// Calculate actual period status based on dates
let periodStatus;
if (now < startDate) {
  periodStatus = 'Upcoming';
} else if (now >= startDate && now <= endDate) {
  periodStatus = 'Ongoing';
} else {
  periodStatus = 'Ended';
}

// Determine enrollment status
const enrollmentOpen =
  period.status === 'ongoing' || period.status === 'upcoming';

// Display status combines both period and enrollment info
let displayStatus;
if (periodStatus === 'Ended') {
  displayStatus = 'Ended';
} else if (periodStatus === 'Ongoing') {
  displayStatus = enrollmentOpen ? 'Ongoing' : 'Ongoing (Enrollment Closed)';
} else {
  // Upcoming
  displayStatus = enrollmentOpen ? 'Upcoming' : 'Upcoming (Enrollment Closed)';
}

return {
  ...period,
  status: displayStatus,
  periodStatus: periodStatus, // The actual period status
  enrollmentOpen: enrollmentOpen, // Whether enrollment is open
};
```

### 2. Academic Period Select Component (`client/src/components/inputs/AcademicPeriodSelect.js`)

**Lines 136-152**: Updated badge colors to distinguish enrollment status

```javascript
<span
  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
    period.status === 'Ongoing'
      ? 'bg-green-100 text-green-700' // Fully active
      : period.status.startsWith('Ongoing')
      ? 'bg-yellow-100 text-yellow-700' // Active but enrollment closed
      : period.status === 'Upcoming'
      ? 'bg-blue-100 text-blue-700' // Coming soon
      : period.status.startsWith('Upcoming')
      ? 'bg-orange-100 text-orange-700' // Coming but enrollment closed
      : 'bg-gray-100 text-gray-600' // Ended
  }`}
>
  {period.status}
</span>
```

### 3. Enrollment Period Store (`client/src/stores/enrollmentPeriodStore.js`)

**Lines 60-101**: Updated period status calculation with same logic

### 4. Enrollment Period Utils (`client/src/utils/enrollmentPeriodUtils.js`)

**Lines 67-132**: Updated `getEnrollmentPeriodStatus()` function to return both statuses

```javascript
return {
  status, // Display status (e.g., "Ongoing (Enrollment Closed)")
  bgColor, // CSS background color class
  textColor, // CSS text color class
  borderColor, // CSS border color class
  isActive: periodStatus === 'Ongoing', // Whether period is currently active
  periodStatus, // The actual period status (Upcoming/Ongoing/Ended)
  enrollmentOpen, // Whether enrollment is currently open
};
```

### 5. Enrollment Period Page (`client/src/pages/admin/EnrollmentPeriod.js`)

**Lines 116-131**: Updated badge color mapping to include new statuses

## Color Coding

The UI now uses distinct colors to make the status immediately clear:

| Status                           | Color     | Meaning                                  |
| -------------------------------- | --------- | ---------------------------------------- |
| **Ongoing**                      | 🟢 Green  | Period active, enrollment open           |
| **Ongoing (Enrollment Closed)**  | 🟡 Yellow | Period active, but no new enrollments    |
| **Upcoming**                     | 🔵 Blue   | Period hasn't started, enrollment open   |
| **Upcoming (Enrollment Closed)** | 🟠 Orange | Period hasn't started, enrollment closed |
| **Ended**                        | 🔴 Red    | Period finished (past end date)          |

## Database Schema

The database schema **remains unchanged**:

```prisma
model academic_period {
  id            String    @id @default(cuid())
  batchName     String
  periodName    String
  status        AcademicPeriodStatus @default(upcoming)  // Enrollment status
  startAt       DateTime                                  // Period start date
  endAt         DateTime                                  // Period end date
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  // Relations...
}

enum AcademicPeriodStatus {
  upcoming  // Enrollment not yet open
  ongoing   // Enrollment open
  ended     // Enrollment closed
}
```

**Key Point**: The `status` enum values (`upcoming`, `ongoing`, `ended`) refer to **enrollment status**, not the actual academic period dates.

## API Endpoint Behavior

The `endEnrollmentForPeriod()` function in the backend still sets `status: 'ended'`:

```javascript
// api/model/academic_period.js
export const endEnrollmentForPeriod = (id) => {
  return prisma.academic_period.update({
    where: { id },
    data: { status: 'ended' }, // This closes enrollment only
  });
};
```

This is correct! The frontend now interprets this properly:

- If period dates are still active → "Ongoing (Enrollment Closed)"
- If period dates have passed → "Ended"

## Benefits

1. **Clear Communication**: Users immediately understand whether classes are happening and if enrollment is open
2. **No Database Changes**: Works with existing schema and API
3. **Consistent Throughout App**: All components use the same logic
4. **Admin Clarity**: Admins can see at a glance which periods accept enrollments vs which are just administratively closed
5. **Future-Proof**: Supports scenarios like:
   - Early enrollment closure
   - Late-starting periods with pre-closed enrollment
   - Historical periods that remain visible

## Testing Scenarios

### Scenario 1: Active Period, Enrollment Open

```
Period: Fall 2025 (Sep 1 - Dec 15)
Current: Oct 15
Status: ongoing
Result: "Ongoing" (green)
```

### Scenario 2: Active Period, Enrollment Closed

```
Period: Fall 2025 (Sep 1 - Dec 15)
Current: Oct 15
Status: ended
Result: "Ongoing (Enrollment Closed)" (yellow) ← THIS WAS THE BUG
```

### Scenario 3: Future Period, Enrollment Not Yet Open

```
Period: Spring 2026 (Jan 15 - May 20)
Current: Oct 15, 2025
Status: upcoming
Result: "Upcoming" (blue)
```

### Scenario 4: Future Period, Enrollment Pre-Closed

```
Period: Spring 2026 (Jan 15 - May 20)
Current: Oct 15, 2025
Status: ended
Result: "Upcoming (Enrollment Closed)" (orange)
```

### Scenario 5: Past Period

```
Period: Summer 2024 (Jun 1 - Aug 30)
Current: Oct 15, 2025
Status: ended
Result: "Ended" (red)
```

## Related Files

### Modified Files:

- ✅ `client/src/pages/admin/Schedule.js`
- ✅ `client/src/components/inputs/AcademicPeriodSelect.js`
- ✅ `client/src/stores/enrollmentPeriodStore.js`
- ✅ `client/src/utils/enrollmentPeriodUtils.js`
- ✅ `client/src/pages/admin/EnrollmentPeriod.js`

### Unchanged (No Changes Needed):

- ✅ `api/model/academic_period.js` - Backend logic remains correct
- ✅ `api/controller/academic_period_controller.js` - API endpoints work as intended
- ✅ `api/prisma/schema.prisma` - Database schema unchanged

## Migration Notes

**No migration required!** This is purely a frontend display fix. Existing data works without modification.

If you want to add explicit enrollment dates in the future, you could add optional fields:

```prisma
model academic_period {
  // ... existing fields ...
  enrollmentStartAt DateTime?
  enrollmentEndAt   DateTime?
}
```

But this is not necessary - the current solution works well.
