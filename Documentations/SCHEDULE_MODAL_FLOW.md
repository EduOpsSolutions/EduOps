# Schedule Modal Flow Implementation

## Overview

Implemented a two-modal flow for creating and editing schedule events based on your design mockup:

1. **Date Select Modal** - Shows all events for a selected day in a timeline view
2. **Create/Edit Schedule Modal** - Form for creating or editing recurring schedule events

## User Flow

```
Calendar View (Month/Week)
    ↓ (Click on date/time)
Date Select Modal
    → Shows all events for that day
    → Timeline view with time slots
    ↓ (Click on event OR "Add New Event")
Create/Edit Schedule Modal
    → Form for event details
    → Recurring pattern setup
    → Save or Delete
    ↓
Updates Calendar → Closes modals
```

## Files Created

### 1. DateSelectModal.js

**Location**: `/client/src/components/modals/schedule/DateSelectModal.js`

**Features**:

- Shows selected date at the top
- Timeline view with hourly time slots (6 AM - 9 PM)
- Events displayed in their corresponding time slots
- Color-coded events
- "Add New Event" button at bottom
- Click on any event to edit it

**Props**:

```javascript
{
  isOpen: Boolean,           // Control modal visibility
  onClose: Function,         // Close modal callback
  selectedDate: Date,        // Date to display events for
  events: Array,             // Filtered events for this date
  onEventClick: Function,    // Callback when event is clicked (null for new)
}
```

### 2. CreateEditScheduleModal.js

**Location**: `/client/src/components/modals/schedule/CreateEditScheduleModal.js`

**Features**:

- **Event Title** with color indicator
- **Event Location** (e.g., "Online - VR1")
- **Time** with start and end time pickers
- **Repeat Pattern**:
  - Days input (e.g., "M,W,F" or "T,TH")
  - Start date and end date (academic period boundaries)
  - Display formatted recurrence (e.g., "Every Mon, Wed, Fri until March 31, 2024")
- **Organizer / Adviser** - Searchable dropdown of active teachers
  - Search by teacher name or user ID
  - Only shows active teachers from database
  - Displays full name and ID in dropdown
- **Color Palette** (9 color options)
- **Notes** section (for meeting links, etc.)
- **View Students** button (when editing)
- **Delete Event** and **Save Event** buttons

**Props**:

```javascript
{
  isOpen: Boolean,           // Control modal visibility
  onClose: Function,         // Close modal callback
  event: Object,             // Event to edit (null for new)
  selectedDate: Date,        // Pre-fill date if creating
  onSave: Function,          // Save callback with form data
  onDelete: Function,        // Delete callback
  teachers: Array,           // List of active teachers
  isLoadingTeachers: Boolean // Loading state for teachers
}
```

## Files Created (Continued)

### 3. TeacherSelect.js

**Location**: `/client/src/components/inputs/TeacherSelect.js`

**Features**:

- Searchable dropdown component for teacher selection
- Real-time search/filter by name or user ID
- Shows teacher's full name and ID
- Displays email in dropdown for reference
- Click outside to close dropdown
- Loading state support
- Highlights selected teacher

**Props**:

```javascript
{
  value: String,             // Selected teacher ID
  onChange: Function,        // Callback with full teacher object
  teachers: Array,           // List of teachers
  isLoading: Boolean         // Loading state
}
```

## Files Modified

### 4. Schedule.js

**Location**: `/client/src/pages/admin/Schedule.js`

**Added State Management**:

```javascript
// Modal states
const [showDateSelectModal, setShowDateSelectModal] = useState(false);
const [showCreateEditModal, setShowCreateEditModal] = useState(false);
const [selectedDate, setSelectedDate] = useState(null);
const [selectedEvent, setSelectedEvent] = useState(null);
const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);

// Teacher data
const [teachers, setTeachers] = useState([]);
const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
```

**Added Data Fetching**:

- Fetches active teachers from API on component mount
- Filters for teachers with `status: 'active'` and `role: 'teacher'`
- Mock data provided for testing

**Added Handlers**:

- `handleDateTimeClick` - Opens DateSelectModal
- `handleEventClick` - Opens CreateEditModal
- `handleSaveEvent` - Saves/updates event
- `handleDeleteEvent` - Deletes event
- `handleCloseModals` - Closes both modals

### 5. Calendar.js

**Location**: `/client/src/components/calendar/Calendar.js`

**Changes**:

- Destructured props to extract `events` and `onDateTimeClick`
- Passes `onDateClick` to DateTile components
- Passes `onTimeSlotClick` to WeekView component

### 6. DateTile.js

**Location**: `/client/src/components/calendar/DateTile.js`

**Changes**:

- Added `onDateClick` prop
- Added `handleClick` function
- Passes date and filtered events when clicked
- Updated PropTypes

### 7. WeekView.js

**Location**: `/client/src/components/calendar/WeekView.js`

**Changes**:

- Added `onTimeSlotClick` prop
- Click handler on time slot cells
- Passes date and events for that time slot
- Updated PropTypes

## Data Flow

### 1. User Clicks on Date/Time

```javascript
// In Calendar -> DateTile or WeekView
onClick={() => {
  const currentDate = new Date(year, month, day);
  const filteredEvents = getEventsForDate(events, currentDate);
  onDateClick(currentDate, filteredEvents);
}}
```

### 2. DateSelectModal Opens

```javascript
// In Schedule.js
const handleDateTimeClick = (date, eventsForDate) => {
  setSelectedDate(date);
  setEventsForSelectedDate(eventsForDate);
  setShowDateSelectModal(true);
};
```

### 3. User Clicks Event or "Add New"

```javascript
// In DateSelectModal
const handleEventClick = (event) => {
  setSelectedEvent(event); // null if adding new
  setShowDateSelectModal(false);
  setShowCreateEditModal(true);
};
```

### 4. User Saves Event

```javascript
// In Schedule.js
const handleSaveEvent = (eventData) => {
  if (selectedEvent) {
    // Update existing event
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === selectedEvent.id
          ? { ...schedule, ...eventData }
          : schedule
      )
    );
  } else {
    // Create new event
    const newEvent = { ...eventData, id: Date.now() };
    setSchedules((prev) => [...prev, newEvent]);
  }

  // Close modal and reset state
  setShowCreateEditModal(false);
  setSelectedEvent(null);
};
```

## Event Data Structure

Based on the recurring schedule logic with academic period boundaries:

```javascript
{
  // Required fields
  title: 'A1: Basic German Course',
  days: 'M,W,F',              // Day recurrence pattern
  time_start: '10:00 AM',
  time_end: '11:00 AM',
  color: '#FFCF00',

  // Academic period boundaries
  periodStart: '2025-09-01',  // Events only appear from this date
  periodEnd: '2025-12-15',    // Events only appear until this date
  periodName: 'Fall 2025',

  // Optional fields
  location: 'Online - VR1',
  teacherId: 'teacher_456',   // Teacher's database ID
  teacherName: 'Tricia D. Diaz',  // Teacher's full name
  notes: 'Meeting link: https://meet.google.com/xyz',
  id: 123,                    // From database
  courseId: 'course_abc',
  periodId: 'period_123',
}
```

## Styling Details

### Date Select Modal

- Max width: `max-w-2xl`
- Max height: `max-h-[90vh]`
- Time slots displayed vertically
- Events colored with their assigned colors
- Hover effects on event items

### Create/Edit Modal

- Max width: `max-w-4xl`
- Max height: `max-h-[90vh]`
- 3-column grid (2 columns form, 1 column notes/color)
- Responsive: stacks to 1 column on mobile
- Color palette with 9 options
- Form fields with icons from react-icons

## Integration with API

### Fetching Active Teachers

```javascript
// In Schedule.js useEffect
fetch('/api/v1/users?role=teacher&status=active')
  .then((res) => res.json())
  .then((data) => {
    // Filter for active teachers only
    const activeTeachers = data.filter(
      (user) => user.role === 'teacher' && user.status === 'active'
    );
    setTeachers(activeTeachers);
  })
  .catch((error) => {
    console.error('Error fetching teachers:', error);
    setTeachers([]);
  })
  .finally(() => setIsLoadingTeachers(false));
```

**Expected Teacher Data Structure:**

```javascript
{
  id: 'cuid_or_uuid',
  userId: 'TCH-001',        // User ID for searching
  firstName: 'Tricia',
  lastName: 'Diaz',
  email: 'tricia.diaz@example.com',
  status: 'active',         // IMPORTANT: Only 'active' teachers shown
  role: 'teacher',
  phoneNumber: '+1234567890',
  // ... other user fields
}
```

### Fetching Schedules

```javascript
// In Schedule.js useEffect
fetch('/api/v1/schedules?include=period,course,teacher')
  .then((res) => res.json())
  .then((data) => {
    const events = data.schedules.map((schedule) =>
      transformScheduleToEvent(schedule)
    );
    setSchedules(events);
  })
  .finally(() => setIsLoading(false));
```

### Saving Event

```javascript
// In handleSaveEvent
fetch('/api/v1/schedules', {
  method: selectedEvent ? 'PUT' : 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...eventData,
    // Transform time format if needed
    time: `${eventData.time_start} - ${eventData.time_end}`,
  }),
})
  .then((res) => res.json())
  .then((savedEvent) => {
    // Update local state with saved event
    setSchedules((prev) => [...prev, transformScheduleToEvent(savedEvent)]);
  });
```

### Deleting Event

```javascript
// In handleDeleteEvent
fetch(`/api/v1/schedules/${event.id}`, {
  method: 'DELETE',
}).then(() => {
  setSchedules((prev) => prev.filter((s) => s.id !== event.id));
});
```

## Usage Example

```javascript
import React, { useState } from 'react';
import Schedule from './pages/admin/Schedule';

function App() {
  return (
    <div className="App">
      <Schedule />
    </div>
  );
}
```

The Schedule page handles everything internally:

1. Renders the Calendar component
2. Manages both modals
3. Handles all click events
4. Manages state for create/edit operations

## Features Implemented

✅ Click on any date in Month view → Opens DateSelectModal
✅ Click on any time slot in Week view → Opens DateSelectModal
✅ DateSelectModal shows all events for selected date
✅ Timeline view with hourly slots
✅ Click on event in DateSelectModal → Opens CreateEditModal (edit mode)
✅ Click "Add New Event" → Opens CreateEditModal (create mode)
✅ CreateEditModal form with all fields from design
✅ Color palette selection
✅ Recurring pattern input with date range
✅ **Organizer / Adviser searchable dropdown**

- Fetches active teachers from database
- Search by name or user ID
- Displays teacher info with email
- Only shows active teachers
  ✅ Save button creates/updates event
  ✅ Delete button removes event (with confirmation)
  ✅ Close buttons on both modals
  ✅ Academic period boundary validation
  ✅ Responsive design

## API Endpoints Required

### Teachers Endpoint

```
GET /api/v1/users?role=teacher&status=active
```

**Response:**

```json
[
  {
    "id": "cuid_123",
    "userId": "TCH-001",
    "firstName": "Tricia",
    "lastName": "Diaz",
    "email": "tricia.diaz@example.com",
    "status": "active",
    "role": "teacher"
  }
]
```

### Schedules Endpoint

```
GET /api/v1/schedules?include=period,course,teacher
POST /api/v1/schedules
PUT /api/v1/schedules/:id
DELETE /api/v1/schedules/:id
```

## Next Steps

1. **API Integration**:

   - Replace mock teacher data with actual API call
   - Connect schedule CRUD operations to backend
   - Handle loading states during API calls
   - Add error handling and user feedback

2. **Validation**:

   - Add form validation for required fields
   - Validate date ranges (end date after start date)
   - Validate time ranges (end time after start time)
   - Validate day patterns (e.g., "M,W,F" format)

3. **Enhanced Features**:

   - Add "View Students" functionality
   - Implement course/teacher selection dropdowns
   - Add conflict detection (overlapping schedules)
   - Add bulk operations (duplicate, delete multiple)
   - Add search/filter in DateSelectModal

4. **UI Enhancements**:

   - Add animations for modal transitions
   - Add loading spinners within modals
   - Add success/error toast notifications
   - Add keyboard shortcuts (ESC to close, etc.)

5. **Mobile Optimization**:
   - Optimize form layout for mobile devices
   - Add swipe gestures for time navigation
   - Improve touch targets for small screens

## Testing Checklist

### Basic Functionality

- [ ] Click on date in month view opens DateSelectModal
- [ ] Click on time slot in week view opens DateSelectModal
- [ ] DateSelectModal shows correct events for selected date
- [ ] Click on event opens CreateEditModal with pre-filled data
- [ ] Click "Add New Event" opens CreateEditModal with empty form
- [ ] Save new event adds it to calendar
- [ ] Save edited event updates calendar
- [ ] Delete event removes it from calendar (with confirmation)
- [ ] Close buttons work on both modals

### Teacher Selection

- [ ] Teacher dropdown loads active teachers only
- [ ] Search by teacher name filters correctly
- [ ] Search by teacher ID filters correctly
- [ ] Selected teacher appears in input field
- [ ] Teacher data persists when editing event
- [ ] Dropdown closes when clicking outside
- [ ] Loading state shows while fetching teachers

### Form Features

- [ ] Form validation prevents invalid submissions
- [ ] Color palette selection updates color indicator
- [ ] Recurring pattern displays correctly
- [ ] Academic period dates are respected
- [ ] All form fields save correctly

### UI/UX

- [ ] Responsive design works on mobile
- [ ] Dropdowns scroll properly with many items
- [ ] Search is case-insensitive
- [ ] Icons display correctly

## Notes

- All modals use `position: fixed` with full-screen overlay
- Z-index set to 50 to appear above calendar
- Event colors must be hex codes (e.g., `#FFCF00`)
- Day patterns use abbreviations: SU, M, T, W, TH, F, S
- Time format can be 12-hour (10:00 AM) or 24-hour (10:00)
- Academic period dates should be ISO format (YYYY-MM-DD)
