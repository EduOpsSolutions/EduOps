# Teacher Select Feature - Implementation Summary

## Overview

Enhanced the Schedule Modal with a searchable teacher dropdown for the "Organizer / Adviser" field. The component fetches active teachers from the database and allows searching by name or user ID.

## Changes Made

### 1. New Component: TeacherSelect

**File**: `/client/src/components/inputs/TeacherSelect.js`

A reusable searchable dropdown component for selecting teachers.

**Key Features**:

- 🔍 **Real-time Search**: Filter by teacher name or user ID
- 👥 **Active Teachers Only**: Only displays teachers with `status: 'active'`
- 📧 **Detailed Display**: Shows full name, user ID, and email
- 🎯 **Click Outside to Close**: Dropdown closes when clicking outside
- ⏳ **Loading State**: Shows loading message while fetching data
- ✨ **Highlight Selection**: Selected teacher is highlighted
- 📱 **Responsive**: Scrollable dropdown for many teachers

**Component Interface**:

```javascript
<TeacherSelect
  value={teacherId} // Selected teacher's ID
  onChange={handleSelect} // Callback with full teacher object
  teachers={teachers} // Array of teacher objects
  isLoading={isLoadingTeachers} // Loading state
/>
```

### 2. Updated CreateEditScheduleModal

**File**: `/client/src/components/modals/schedule/CreateEditScheduleModal.js`

**Changes**:

- Changed label from "Organizer" to **"Organizer / Adviser"**
- Replaced text input with `TeacherSelect` component
- Updated form data structure:
  - `organizer` (text) → `teacherId` (ID) + `teacherName` (display)
- Added `handleTeacherSelect()` to process teacher selection
- Added new props: `teachers` and `isLoadingTeachers`
- Updated PropTypes to match new structure

### 3. Updated Schedule.js

**File**: `/client/src/pages/admin/Schedule.js`

**New State**:

```javascript
const [teachers, setTeachers] = useState([]);
const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
```

**New useEffect Hook**:

- Fetches teachers on component mount
- Filters for `role: 'teacher'` and `status: 'active'`
- Includes mock data for testing (replace with real API)
- Passes teachers to CreateEditScheduleModal

## Data Flow

### 1. Fetch Teachers

```javascript
// On component mount
fetch('/api/v1/users?role=teacher&status=active')
  → Filter active teachers
  → setTeachers(activeTeachers)
```

### 2. User Selects Teacher

```javascript
// In TeacherSelect component
User types search term
  → Filter teachers by name/ID
  → Display filtered list
  → User clicks teacher
  → onChange(teacherObject) called
```

### 3. Save Teacher Selection

```javascript
// In CreateEditScheduleModal
handleTeacherSelect(teacher)
  → setFormData({
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`
    })
  → Data saved when form submitted
```

## API Integration

### Expected Teacher Data Structure

From your Prisma schema (`users` model):

```javascript
{
  id: "cuid_abc123",          // Primary key
  userId: "TCH-001",          // User ID for display/search
  firstName: "Tricia",
  lastName: "Diaz",
  email: "tricia.diaz@example.com",
  phoneNumber: "+1234567890",
  status: "active",           // IMPORTANT: Only 'active' shown
  role: "teacher",            // IMPORTANT: Only 'teacher' shown
  profilePicLink: "...",
  createdAt: "2024-01-15T10:00:00Z",
  // ... other fields
}
```

### API Endpoint Required

```
GET /api/v1/users?role=teacher&status=active
```

**Query Parameters**:

- `role=teacher` - Filter by teacher role
- `status=active` - Only active users

**Response Format**:

```json
{
  "success": true,
  "teachers": [
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
}
```

### Updating Schedule.js for Real API

Replace the mock data in `Schedule.js`:

```javascript
// Remove this mock data block
setTimeout(() => {
  const mockTeachers = [...];
  setTeachers(mockTeachers);
  setIsLoadingTeachers(false);
}, 500);

// Replace with real API call
fetch('/api/v1/users?role=teacher&status=active')
  .then(res => res.json())
  .then(data => {
    // Adjust based on your API response structure
    const activeTeachers = data.teachers || data;
    setTeachers(activeTeachers);
  })
  .catch(error => {
    console.error('Error fetching teachers:', error);
    setTeachers([]);
  })
  .finally(() => setIsLoadingTeachers(false));
```

## Search Functionality

### Search Algorithm

The component searches through:

1. **Full Name**: `firstName + lastName` (case-insensitive)
2. **User ID**: `userId` field (case-insensitive)

```javascript
const filteredTeachers = teachers.filter((teacher) => {
  const searchLower = searchTerm.toLowerCase();
  const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
  const userId = teacher.userId?.toLowerCase() || '';

  return fullName.includes(searchLower) || userId.includes(searchLower);
});
```

### Search Examples

| Search Term | Matches                         |
| ----------- | ------------------------------- |
| "tricia"    | Tricia Diaz                     |
| "TCH-001"   | Teacher with ID TCH-001         |
| "diaz"      | Any teacher with "Diaz" in name |
| "john"      | John Smith                      |

## UI/UX Features

### Dropdown Display

Each teacher item shows:

```
┌────────────────────────────────────┐
│ Tricia Diaz                    ◄ Name (bold)
│ ID: TCH-001 • tricia@example.com  ◄ ID and email (gray)
└────────────────────────────────────┘
```

### States

1. **Empty State** (no teachers):

   ```
   No teachers found
   ```

2. **Loading State**:

   ```
   Loading teachers...
   ```

3. **Search Results**:

   - Real-time filtering as user types
   - Case-insensitive matching
   - Highlights selected teacher

4. **Selected State**:
   - Selected teacher's name shown in input
   - Highlighted in dropdown with red background

### Accessibility

- ✅ Keyboard navigation (auto-focus on search)
- ✅ Click outside to close
- ✅ Clear visual feedback for selection
- ✅ Loading states
- ✅ Error handling

## Integration Checklist

### Backend Requirements

- [ ] Create/verify API endpoint: `GET /api/v1/users`
- [ ] Support query parameters: `?role=teacher&status=active`
- [ ] Return teacher data in expected format
- [ ] Include necessary fields: id, userId, firstName, lastName, email, status, role

### Frontend Tasks

- [x] Create TeacherSelect component
- [x] Update CreateEditScheduleModal
- [x] Update Schedule.js with teacher fetching
- [x] Add loading states
- [ ] Replace mock data with real API call
- [ ] Add error handling/retry logic
- [ ] Test with real data

### Testing

- [ ] Verify only active teachers appear
- [ ] Test search by full name
- [ ] Test search by user ID
- [ ] Test with empty search
- [ ] Test with no results
- [ ] Test loading state
- [ ] Test dropdown scroll with many items
- [ ] Test click outside to close
- [ ] Test on mobile devices

## Example Usage

### Creating New Schedule with Teacher

1. User clicks on date in calendar
2. DateSelectModal opens
3. User clicks "Add New Event"
4. CreateEditScheduleModal opens
5. User fills in event details
6. User clicks "Organizer / Adviser" dropdown
7. Dropdown shows active teachers
8. User searches "TCH-001" or "Tricia"
9. User selects "Tricia Diaz"
10. Selected teacher appears in field
11. User clicks "Save Event"
12. Event saved with:
    ```javascript
    {
      ...eventData,
      teacherId: "cuid_123",
      teacherName: "Tricia Diaz"
    }
    ```

### Editing Schedule with Existing Teacher

1. Event has existing teacher: `teacherId: "cuid_123"`
2. Modal opens with pre-filled data
3. Dropdown shows "Tricia Diaz" as selected
4. User can search and select different teacher
5. Save updates teacherId and teacherName

## Database Schema Alignment

Aligns with your Prisma schema:

```prisma
model users {
  id        String   @id @default(cuid())
  userId    String   @unique
  firstName String
  lastName  String
  email     String   @unique
  status    String?  // "active", "inactive", etc.
  role      String?  @default("student")  // "teacher", "admin", etc.

  teacherSchedules schedule[] @relation("TeacherSchedules")
  // ... other fields
}

model schedule {
  id        Int      @id @default(autoincrement())
  teacherId String?
  teacher   users?   @relation("TeacherSchedules", fields: [teacherId], references: [id])
  // ... other fields
}
```

## Benefits

1. **Better UX**: Searchable dropdown vs free text input
2. **Data Validation**: Only valid teachers can be selected
3. **Consistent Data**: Teacher IDs stored correctly
4. **Active Teachers Only**: Prevents assigning inactive teachers
5. **Search Functionality**: Find teachers quickly
6. **Display Rich Info**: See email and ID while selecting
7. **Reusable Component**: Can be used elsewhere in app

## Troubleshooting

### Teachers Not Loading

Check:

1. API endpoint is correct: `/api/v1/users?role=teacher&status=active`
2. API returns proper response format
3. CORS configured if frontend/backend on different domains
4. Authentication headers included if required

### Search Not Working

Check:

1. Teacher objects have `userId`, `firstName`, `lastName` fields
2. Fields are strings (not null/undefined)
3. Search is case-insensitive

### Selected Teacher Not Persisting

Check:

1. `teacherId` is being saved in form data
2. `teacherId` matches the `id` field from teacher object
3. Teacher still exists and is active when editing

## Next Steps

1. **Implement Backend Endpoint**:

   - Create route handler for GET `/api/v1/users`
   - Add query parameter filtering
   - Include status and role filters
   - Return paginated results if needed

2. **Test with Real Data**:

   - Replace mock teachers with API call
   - Test with production database
   - Verify performance with many teachers

3. **Enhance Features** (Optional):

   - Add teacher avatars
   - Add pagination for large lists
   - Add "Recently Used" teachers section
   - Add keyboard shortcuts (arrow keys, enter)
   - Add teacher details tooltip on hover

4. **Error Handling**:
   - Show error message if API fails
   - Add retry button
   - Graceful fallback to text input

## Files Modified Summary

- ✨ **Created**: `/client/src/components/inputs/TeacherSelect.js` (147 lines)
- ✏️ **Modified**: `/client/src/components/modals/schedule/CreateEditScheduleModal.js`
- ✏️ **Modified**: `/client/src/pages/admin/Schedule.js`
- 📝 **Updated**: `/SCHEDULE_MODAL_FLOW.md`
- 📄 **Created**: `/TEACHER_SELECT_FEATURE.md` (this file)

All linting checks passed! ✅
