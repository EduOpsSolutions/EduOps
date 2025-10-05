# Schedule Backend Implementation

## Overview

Implemented a complete backend API for managing schedules with admin-only access controls. The implementation follows the existing codebase patterns and integrates seamlessly with the frontend schedule management system.

## Architecture

### Database Schema (Prisma)

Updated the `schedule` model with additional fields to support the frontend requirements:

```prisma
model schedule {
  id          Int       @id @default(autoincrement())
  days        String                      // "M,W,F" or "T,TH"
  time        String?                     // Backward compatibility
  time_start  String?                     // "10:00 AM" or "10:00"
  time_end    String?                     // "11:00 AM" or "11:00"
  location    String?                     // "Online - VR1"
  notes       String?   @db.Text         // Meeting links, additional info
  color       String?   @default("#FFCF00") // Hex color code
  periodStart DateTime?                   // Schedule start date
  periodEnd   DateTime?                   // Schedule end date
  courseId    String?
  periodId    String?
  teacherId   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  // Relations
  course        course?          @relation(...)
  period        academic_period? @relation(...)
  teacher       users?           @relation(...)
  userSchedules user_schedule[]
}
```

### Migration

Created migration: `20251004175654_add_schedule_fields`

**Location**: `/api/prisma/migrations/20251004175654_add_schedule_fields/migration.sql`

## File Structure

```
api/
├── model/
│   └── schedule_model.js          # Data access layer
├── controller/
│   └── schedule_controller.js     # Business logic layer
├── middleware/
│   └── scheduleValidator.js       # Validation middleware
└── routes/
    └── v1/
        ├── schedule_routes.js     # Route definitions
        └── index_routes.js        # Route registration
```

## API Endpoints

All endpoints require authentication (`verifyToken` middleware).

### Public Routes (Authenticated Users)

#### GET /api/v1/schedules

Get all schedules with related course, period, and teacher information.

**Response:**

```json
[
  {
    "id": 1,
    "courseId": "course_abc",
    "courseName": "A1: Basic German Course",
    "academicPeriodId": "period_123",
    "academicPeriodName": "Fall 2025 - Batch A",
    "teacherId": "teacher_456",
    "teacherName": "Tricia Diaz",
    "location": "Online - VR1",
    "days": "M,W,F",
    "time_start": "10:00 AM",
    "time_end": "11:00 AM",
    "periodStart": "2025-09-01",
    "periodEnd": "2025-12-15",
    "color": "#FFCF00",
    "notes": "Meeting link: https://meet.google.com/xyz",
    "createdAt": "2025-10-04T10:00:00.000Z",
    "updatedAt": "2025-10-04T10:00:00.000Z"
  }
]
```

#### GET /api/v1/schedules/:id

Get a single schedule by ID.

**Response:** Single schedule object (same structure as above)

#### GET /api/v1/schedules/period/:periodId

Get all schedules for a specific academic period.

#### GET /api/v1/schedules/teacher/:teacherId

Get all schedules for a specific teacher.

### Admin-Only Routes

#### POST /api/v1/schedules

Create a new schedule.

**Required Middleware:**

- `verifyToken` - User authentication
- `validateUserIsAdmin` - Admin role check
- `validateCreateSchedule` - Input validation
- `validateTimeConstraints` - Time rules validation
- `validateDateBoundaries` - Date range validation

**Request Body:**

```json
{
  "courseId": "course_abc",
  "periodId": "period_123",
  "teacherId": "teacher_456",
  "location": "Online - VR1",
  "days": "M,W,F",
  "time_start": "10:00 AM",
  "time_end": "11:00 AM",
  "periodStart": "2025-09-01",
  "periodEnd": "2025-12-15",
  "color": "#FFCF00",
  "notes": "Optional notes"
}
```

**Validation Rules:**

- All fields except `notes` are required
- `days` must match pattern: `M,W,F` or `T,TH` (valid abbreviations: M, T, W, TH, F, S, SU)
- `time_start` must be before `time_end`
- Minimum duration: 30 minutes
- Latest end time: 9:00 PM (21:00)
- `periodStart` and `periodEnd` must be within the academic period boundaries
- `color` must be a valid hex code (e.g., `#FFCF00`)

**Response:** Created schedule object

**Error Responses:**

- `400` - Validation error
- `404` - Academic period not found
- `409` - Schedule conflict detected

#### PUT /api/v1/schedules/:id

Update an existing schedule.

**Required Middleware:** Same as POST

**Request Body:** Same as POST (all fields optional)

**Response:** Updated schedule object

#### DELETE /api/v1/schedules/:id

Soft delete a schedule (sets `deletedAt` timestamp).

**Required Middleware:**

- `verifyToken`
- `validateUserIsAdmin`

**Response:**

```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

## Validation Rules

### Time Constraints

Implemented in `validateTimeConstraints` middleware:

1. **Start Before End**: Start time must be before end time
2. **Minimum Duration**: Schedule must be at least 30 minutes long
3. **Latest End Time**: Schedule cannot end later than 9:00 PM (21:00)
4. **Format Support**: Accepts both 12-hour (`10:00 AM`) and 24-hour (`10:00`) formats

### Date Boundaries

Implemented in `validateDateBoundaries` middleware:

1. **Within Academic Period**: Schedule dates must fall within the academic period's start and end dates
2. **Valid Range**: Schedule end date must be after start date
3. **Database Verification**: Validates against actual academic period data from database

### Schedule Conflicts

Implemented in `checkScheduleConflicts` model function:

Checks for conflicts based on:

- Same teacher
- Overlapping days (e.g., both schedules include Monday)
- Overlapping time periods
- Overlapping date ranges

**Note:** Conflicts are detected but not enforced at the API level. The controller returns a 409 status with conflict details, allowing the frontend to handle user decisions.

## Frontend Integration

### Updated Files

#### `/client/src/pages/admin/Schedule.js`

**Changes:**

1. Replaced mock data with real API calls
2. Added error handling for API requests
3. Implemented create, update, and delete operations

**API Calls:**

```javascript
// Fetch schedules
const response = await axiosInstance.get('/schedules');
setSchedules(response.data);

// Create schedule
const response = await axiosInstance.post('/schedules', eventData);
setSchedules((prev) => [...prev, response.data]);

// Update schedule
const response = await axiosInstance.put(`/schedules/${id}`, eventData);
setSchedules((prev) => prev.map((s) => (s.id === id ? response.data : s)));

// Delete schedule
await axiosInstance.delete(`/schedules/${id}`);
setSchedules((prev) => prev.filter((s) => s.id !== id));
```

#### `/client/src/components/modals/schedule/DateSelectModal.js`

**Changes:**

1. Added `useAuthStore` import
2. Added admin check: `const { isAdmin } = useAuthStore()`
3. Conditionally render "Add New Event" button: `{isAdmin() && <button>...}`

## Security Features

### Admin-Only Access

All create, update, and delete operations require:

1. **Authentication**: Valid JWT token in `Authorization` header
2. **Active Status**: User account must be active
3. **Admin Role**: User role must be `admin`

Example middleware chain:

```javascript
router.post(
  '/',
  verifyToken, // Check valid JWT
  validateUserIsAdmin, // Check admin role and active status
  validateCreateSchedule, // Validate input data
  validateTimeConstraints, // Validate time rules
  validateDateBoundaries, // Validate date boundaries
  createSchedule // Execute controller
);
```

### Error Handling

Comprehensive error responses:

```javascript
// Validation error
{
  "error": true,
  "message": "Validation failed",
  "details": [
    "Course is required",
    "Start time must be before end time"
  ]
}

// Conflict error
{
  "error": true,
  "message": "Schedule conflict detected",
  "conflicts": [
    {
      "id": 5,
      "courseName": "A2: Intermediate German",
      "days": "M,W",
      "time_start": "10:00 AM",
      "time_end": "11:30 AM"
    }
  ]
}

// Not found error
{
  "error": true,
  "message": "Schedule not found"
}
```

## Data Transformation

The backend automatically transforms data between database and frontend formats:

### Database → Frontend

```javascript
// Database format
{
  id: 1,
  courseId: "course_abc",
  periodId: "period_123",
  teacherId: "teacher_456",
  periodStart: Date("2025-09-01T00:00:00.000Z"),
  periodEnd: Date("2025-12-15T00:00:00.000Z"),
  course: { name: "A1: Basic German" },
  period: { periodName: "Fall 2025", batchName: "Batch A" },
  teacher: { firstName: "Tricia", lastName: "Diaz" }
}

// Transformed to frontend format
{
  id: 1,
  courseId: "course_abc",
  courseName: "A1: Basic German",
  academicPeriodId: "period_123",
  academicPeriodName: "Fall 2025 - Batch A",
  teacherId: "teacher_456",
  teacherName: "Tricia Diaz",
  periodStart: "2025-09-01",
  periodEnd: "2025-12-15",
  ...
}
```

### Frontend → Database

```javascript
// Frontend sends
{
  periodStart: "2025-09-01",
  periodEnd: "2025-12-15"
}

// Model converts to Date objects
{
  periodStart: new Date("2025-09-01"),
  periodEnd: new Date("2025-12-15")
}
```

## Testing

### Using Postman/cURL

#### 1. Login (Get JWT Token)

```bash
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### 2. Create Schedule (Admin)

```bash
POST /api/v1/schedules
Authorization: Bearer <jwt_token>
{
  "courseId": "course_abc",
  "periodId": "period_123",
  "teacherId": "teacher_456",
  "location": "Online - VR1",
  "days": "M,W,F",
  "time_start": "10:00",
  "time_end": "11:00",
  "periodStart": "2025-09-01",
  "periodEnd": "2025-12-15",
  "color": "#FFCF00"
}
```

#### 3. Get All Schedules

```bash
GET /api/v1/schedules
Authorization: Bearer <jwt_token>
```

#### 4. Update Schedule (Admin)

```bash
PUT /api/v1/schedules/1
Authorization: Bearer <jwt_token>
{
  "location": "Room 101",
  "time_start": "11:00"
}
```

#### 5. Delete Schedule (Admin)

```bash
DELETE /api/v1/schedules/1
Authorization: Bearer <jwt_token>
```

### Testing Validation

#### Invalid Time Range

```json
{
  "time_start": "11:00",
  "time_end": "10:00"
}
// Error: "Start time must be before end time"
```

#### Short Duration

```json
{
  "time_start": "10:00",
  "time_end": "10:15"
}
// Error: "Schedule duration must be at least 30 minutes"
```

#### Late End Time

```json
{
  "time_start": "20:00",
  "time_end": "22:00"
}
// Error: "Latest end time is 9:00 PM"
```

#### Outside Academic Period

```json
{
  "periodId": "period_with_dates_2025-09-01_to_2025-12-15",
  "periodStart": "2025-08-01",
  "periodEnd": "2025-12-31"
}
// Error: "Schedule dates must be within the academic period range..."
```

## Model Functions

### schedule_model.js

**getAllSchedules(options)**

- Get all non-deleted schedules with related data
- Options: `includeCourse`, `includePeriod`, `includeTeacher`

**getScheduleById(id)**

- Get single schedule with all relations

**getSchedulesByPeriod(periodId)**

- Get schedules for specific academic period

**getSchedulesByTeacher(teacherId)**

- Get schedules for specific teacher

**createSchedule(data)**

- Create new schedule with date conversion

**updateSchedule(id, data)**

- Update existing schedule

**deleteSchedule(id)**

- Soft delete (sets deletedAt)

**checkScheduleConflicts(scheduleData, excludeId)**

- Check for teacher/time/date conflicts
- Returns array of conflicting schedules

## Best Practices

### 1. Use Soft Deletes

Schedules are never permanently deleted, maintaining historical data integrity.

### 2. Validate at Multiple Layers

- Frontend: User-friendly immediate feedback
- Backend: Security and data integrity
- Database: Schema constraints

### 3. Transform Data Consistently

Backend always returns transformed data matching frontend expectations.

### 4. Handle Conflicts Gracefully

Conflicts are detected and reported but don't prevent saves, allowing admin override if needed.

### 5. Maintain Backward Compatibility

The `time` field is kept for backward compatibility with existing data.

## Future Enhancements

### Potential Improvements

1. **Bulk Operations**

   - Create/update/delete multiple schedules at once
   - Import schedules from CSV/Excel

2. **Enhanced Conflict Detection**

   - Room/location conflicts
   - Student enrollment conflicts
   - Automated conflict resolution suggestions

3. **Notifications**

   - Email notifications when schedules are created/updated
   - Push notifications for schedule changes
   - Calendar invites (Google Calendar, iCal)

4. **Reporting**

   - Teacher workload reports
   - Room utilization reports
   - Schedule conflict reports

5. **Versioning**

   - Track schedule history
   - Revert to previous versions
   - Audit log for all changes

6. **Recurring Patterns**
   - More complex recurrence rules
   - Exception dates (holidays, breaks)
   - Multiple time slots per day

## Troubleshooting

### Common Issues

**Issue: "No token provided"**

- Ensure Authorization header is set: `Authorization: Bearer <token>`

**Issue: "User is unauthorized"**

- Verify user has admin role
- Check user account is active

**Issue: "Schedule dates must be within academic period range"**

- Verify periodId exists
- Ensure schedule dates fall within period's startAt and endAt

**Issue: "Schedule conflict detected"**

- Review conflicting schedules in response
- Verify teacher/time/date combinations
- Consider adjusting schedule times or dates

**Issue: "Failed to create schedule"**

- Check all required fields are present
- Verify foreign keys (courseId, periodId, teacherId) exist in database
- Review validation error details

## Summary

The schedule backend implementation provides:

✅ Complete CRUD operations for schedules
✅ Admin-only access control for modifications
✅ Comprehensive validation rules matching frontend
✅ Schedule conflict detection
✅ Soft delete for data preservation
✅ Data transformation for frontend compatibility
✅ Error handling and meaningful responses
✅ Integration with existing authentication system
✅ Database schema updates with migration
✅ RESTful API design following existing patterns

The implementation ensures consistency with frontend requirements while maintaining security, data integrity, and scalability.
